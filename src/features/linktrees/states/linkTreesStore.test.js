import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

vi.mock("../api/linkTreeApi.js", () => ({
  linkTreeApi: {
    create: vi.fn(),
    uploadCover: vi.fn(),
    update: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import { linkTreeApi } from "../api/linkTreeApi.js";
import * as store from "./linkTreesStore.js";

const ok = (data, message = "Berhasil") => ({ status: "success", message, data });

beforeEach(() => {
  vi.resetAllMocks();
  store.resetLinkTreesState();
});

describe("fetchLinkTrees", () => {
  it("mengisi koleksi dan mematikan loading", async () => {
    linkTreeApi.getAll.mockResolvedValue(ok({ link_trees: [{ id: 1 }] }));
    await store.fetchLinkTrees();
    expect(get(store.linkTrees)).toEqual([{ id: 1 }]);
    expect(get(store.linkTreesError)).toBeNull();
    expect(get(store.linkTreesLoading)).toBe(false);
    expect(linkTreeApi.getAll).toHaveBeenCalledWith(false);
  });

  it("meneruskan filter milik saya", async () => {
    linkTreeApi.getAll.mockResolvedValue(ok({ link_trees: [] }));
    await store.fetchLinkTrees(true);
    expect(linkTreeApi.getAll).toHaveBeenCalledWith(true);
  });

  it("memakai array kosong bila data tidak sesuai", async () => {
    linkTreeApi.getAll.mockResolvedValue({ status: "success" });
    await store.fetchLinkTrees();
    expect(get(store.linkTrees)).toEqual([]);
  });

  it("menyimpan pesan error bila gagal", async () => {
    linkTreeApi.getAll.mockRejectedValue(new Error("gagal"));
    await store.fetchLinkTrees();
    expect(get(store.linkTreesError)).toBe("gagal");
    expect(get(store.linkTrees)).toEqual([]);
    expect(get(store.linkTreesLoading)).toBe(false);
  });
});

describe("fetchLinkTree dan clearLinkTree", () => {
  it("mengisi detail", async () => {
    linkTreeApi.getById.mockResolvedValue(ok({ link_tree: { id: 5, items: [] } }));
    await store.fetchLinkTree(5);
    expect(get(store.linkTree)).toEqual({ id: 5, items: [] });
    expect(get(store.linkTreeError)).toBeNull();
  });

  it("menandai error bila detail tidak ada di respons", async () => {
    linkTreeApi.getById.mockResolvedValue(ok({}));
    await store.fetchLinkTree(5);
    expect(get(store.linkTree)).toBeNull();
    expect(get(store.linkTreeError)).toBe("Data link tree tidak ditemukan.");
  });

  it("menandai error bila data tidak ada sama sekali", async () => {
    linkTreeApi.getById.mockResolvedValue({ status: "success" });
    await store.fetchLinkTree(5);
    expect(get(store.linkTreeError)).toBe("Data link tree tidak ditemukan.");
  });

  it("menandai error bila request gagal", async () => {
    linkTreeApi.getById.mockRejectedValue(new Error("404"));
    await store.fetchLinkTree(5);
    expect(get(store.linkTreeError)).toBe("404");
  });

  it("clearLinkTree mengosongkan detail dan error", () => {
    store.linkTree.set({ id: 1 });
    store.linkTreeError.set("x");
    store.clearLinkTree();
    expect(get(store.linkTree)).toBeNull();
    expect(get(store.linkTreeError)).toBeNull();
  });
});

const listMutations = [
  ["addLinkTree", () => store.addLinkTree({ title: "T" }), "create", store.isAdding],
  ["removeLinkTree", () => store.removeLinkTree(5), "remove", store.isDeleting],
  ["removeAllLinkTrees", () => store.removeAllLinkTrees(), "removeAll", store.isDeletingAll],
];

describe.each(listMutations)("%s", (_name, run, apiName, flag) => {
  it("sukses lalu memuat ulang daftar dengan filter terakhir", async () => {
    linkTreeApi.getAll.mockResolvedValue(ok({ link_trees: [{ id: 9 }] }));
    await store.fetchLinkTrees(true);
    linkTreeApi[apiName].mockResolvedValue(ok(undefined, "Sukses"));

    const result = await run();

    expect(result).toMatchObject({ ok: true, message: "Sukses" });
    expect(linkTreeApi.getAll).toHaveBeenLastCalledWith(true);
    expect(linkTreeApi.getAll).toHaveBeenCalledTimes(2);
    expect(get(flag)).toBe(false);
  });

  it("gagal tanpa memuat ulang daftar", async () => {
    linkTreeApi[apiName].mockRejectedValue(new Error("gagal"));
    const result = await run();
    expect(result).toMatchObject({ ok: false, message: "gagal" });
    expect(linkTreeApi.getAll).not.toHaveBeenCalled();
    expect(get(flag)).toBe(false);
  });
});

const detailMutations = [
  ["changeLinkTree", () => store.changeLinkTree(5, { title: "T" }), "update", store.isChanging],
  ["changeCover", () => store.changeCover(5, new File(["x"], "c.png")), "uploadCover", store.isChangingCover],
  ["addItem", () => store.addItem(5, { title: "A", url: "https://a.test" }), "addItem", store.isMutatingItem],
  ["changeItem", () => store.changeItem(5, 9, { title: "A", url: "https://a.test" }), "updateItem", store.isMutatingItem],
  ["removeItem", () => store.removeItem(5, 9), "removeItem", store.isMutatingItem],
];

describe.each(detailMutations)("%s", (_name, run, apiName, flag) => {
  it("sukses lalu memuat ulang detail", async () => {
    linkTreeApi[apiName].mockResolvedValue(ok(undefined, "Sukses"));
    linkTreeApi.getById.mockResolvedValue(ok({ link_tree: { id: 5 } }));

    const result = await run();

    expect(result).toMatchObject({ ok: true, message: "Sukses" });
    expect(linkTreeApi.getById).toHaveBeenCalledWith(5);
    expect(get(store.linkTree)).toEqual({ id: 5 });
    expect(get(flag)).toBe(false);
  });

  it("gagal tanpa memuat ulang detail", async () => {
    linkTreeApi[apiName].mockRejectedValue(new Error("gagal"));
    const result = await run();
    expect(result).toMatchObject({ ok: false, message: "gagal" });
    expect(linkTreeApi.getById).not.toHaveBeenCalled();
    expect(get(flag)).toBe(false);
  });
});

describe("bendera mutasi", () => {
  it("isAdding menyala selama request berjalan", async () => {
    let resolveCreate;
    linkTreeApi.create.mockReturnValue(new Promise((resolve) => (resolveCreate = resolve)));
    linkTreeApi.getAll.mockResolvedValue(ok({ link_trees: [] }));

    const pending = store.addLinkTree({ title: "T" });
    expect(get(store.isAdding)).toBe(true);
    resolveCreate(ok(undefined));
    await pending;
    expect(get(store.isAdding)).toBe(false);
  });
});

describe("resetLinkTreesState", () => {
  it("mengosongkan semua state", async () => {
    store.linkTrees.set([{ id: 1 }]);
    store.linkTree.set({ id: 1 });
    store.linkTreesError.set("x");
    store.linkTreeError.set("y");
    store.resetLinkTreesState();
    expect(get(store.linkTrees)).toEqual([]);
    expect(get(store.linkTree)).toBeNull();
    expect(get(store.linkTreesError)).toBeNull();
    expect(get(store.linkTreeError)).toBeNull();
  });
});
