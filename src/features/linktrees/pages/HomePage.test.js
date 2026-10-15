import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchLinkTrees: vi.fn(),
  removeLinkTree: vi.fn(),
  removeAllLinkTrees: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import HomePage from "./HomePage.svelte";
import {
  linkTrees,
  linkTreesLoading,
  linkTreesError,
  isDeletingAll,
  fetchLinkTrees,
  removeLinkTree,
  removeAllLinkTrees,
} from "../states/linkTreesStore.js";
import { showConfirmDialog, showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";

const item = (over = {}) => ({
  id: 1,
  user_id: 1,
  title: "Alpha",
  description: "Deskripsi alpha",
  type: "public",
  cover: "",
  total_links: 2,
  author: { name: "Ana" },
  ...over,
});
const alpha = item();
const beta = item({ id: 2, user_id: 2, title: "Beta", type: "private", total_links: undefined, author: { name: "Budi" } });
const me = { id: 1, name: "Ana", email: "a@x.id", photo: null };

const render = (user = me) => renderWithProviders(HomePage, { path: "/", authToken: "t", user });
const stat = (label) =>
  screen.getAllByText(label).find((el) => el.tagName === "P").nextElementSibling.textContent;

beforeEach(() => {
  vi.resetAllMocks();
  linkTrees.set([]);
  linkTreesLoading.set(false);
  linkTreesError.set(null);
  isDeletingAll.set(false);
});

describe("HomePage - tampilan", () => {
  it("memuat semua Link Tree saat dipasang", () => {
    render();
    expect(fetchLinkTrees).toHaveBeenCalledWith(false);
    expect(screen.getByRole("heading", { name: "Semua Link Tree" })).toBeInTheDocument();
  });

  it("menampilkan loading", () => {
    linkTreesLoading.set(true);
    render();
    expect(screen.getByText("Memuat data...")).toBeInTheDocument();
  });

  it("menampilkan error", () => {
    linkTreesError.set("Gagal memuat");
    render();
    expect(screen.getByRole("alert")).toHaveTextContent("Gagal memuat");
  });

  it("menampilkan keadaan kosong", () => {
    render();
    expect(screen.getByText("Tidak ada Link Tree yang ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan daftar dan statistik", () => {
    linkTrees.set([alpha, beta]);
    render();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(stat("Total Link Tree")).toBe("2");
    expect(stat("Total Tautan")).toBe("2");
    expect(stat("Publik")).toBe("1");
    expect(stat("Milik Saya")).toBe("1");
  });

  it("hanya pemilik yang melihat tombol hapus", () => {
    linkTrees.set([alpha, beta]);
    render();
    expect(screen.getByRole("button", { name: "Hapus Alpha" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hapus Beta" })).not.toBeInTheDocument();
  });

  it("menghitung milik saya sebagai 0 saat profil belum dimuat", () => {
    linkTrees.set([alpha]);
    render(null);
    expect(stat("Milik Saya")).toBe("0");
    expect(screen.queryByRole("button", { name: "Hapus Alpha" })).not.toBeInTheDocument();
  });

  it("memfilter lewat pencarian", async () => {
    linkTrees.set([alpha, beta]);
    render();
    const search = screen.getByLabelText("Cari Link Tree");

    await fireEvent.input(search, { target: { value: "budi" } });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    await fireEvent.input(search, { target: { value: "zzz" } });
    expect(screen.getByText("Tidak ada Link Tree yang ditemukan.")).toBeInTheDocument();
  });
});

describe("HomePage - interaksi", () => {
  it("mengganti filter milik saya", async () => {
    render();
    screen.getByRole("button", { name: "Hanya milik saya" }).click();
    await waitFor(() => expect(fetchLinkTrees).toHaveBeenLastCalledWith(true));
    const toggle = screen.getByRole("button", { name: "Tampilkan semua" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    toggle.click();
    await waitFor(() => expect(fetchLinkTrees).toHaveBeenLastCalledWith(false));
  });

  it("membuka dan menutup modal tambah", async () => {
    render();
    screen.getByRole("button", { name: "Tambah Link Tree" }).click();
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Tambah Link Tree" })).toBeInTheDocument();

    within(dialog).getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("menonaktifkan tombol hapus semua saat proses berjalan", () => {
    isDeletingAll.set(true);
    render();
    expect(screen.getByRole("button", { name: "Hapus Semua" })).toBeDisabled();
  });
});

describe("HomePage - hapus satu", () => {
  beforeEach(() => linkTrees.set([alpha]));

  it("membatalkan bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    render();
    screen.getByRole("button", { name: "Hapus Alpha" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(removeLinkTree).not.toHaveBeenCalled();
  });

  it("menghapus dan menampilkan dialog sukses", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeLinkTree.mockResolvedValue({ ok: true, message: "Terhapus" });
    render();
    screen.getByRole("button", { name: "Hapus Alpha" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Terhapus"));
    expect(removeLinkTree).toHaveBeenCalledWith(1);
  });

  it("menampilkan dialog error saat gagal", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeLinkTree.mockResolvedValue({ ok: false, message: "Gagal hapus" });
    render();
    screen.getByRole("button", { name: "Hapus Alpha" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus"));
  });
});

describe("HomePage - hapus semua", () => {
  it("membatalkan bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    render();
    screen.getByRole("button", { name: "Hapus Semua" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(removeAllLinkTrees).not.toHaveBeenCalled();
  });

  it("menghapus semua dan menampilkan dialog sukses", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeAllLinkTrees.mockResolvedValue({ ok: true, message: "Semua terhapus" });
    render();
    screen.getByRole("button", { name: "Hapus Semua" }).click();
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Semua terhapus"));
  });

  it("menampilkan dialog error saat gagal", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeAllLinkTrees.mockResolvedValue({ ok: false, message: "Gagal semua" });
    render();
    screen.getByRole("button", { name: "Hapus Semua" }).click();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal semua"));
  });
});
