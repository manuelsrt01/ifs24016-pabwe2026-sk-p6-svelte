import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../helpers/apiHelper.js", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../../../helpers/apiHelper.js";
import { linkTreeApi } from "./linkTreeApi.js";

beforeEach(() => apiFetch.mockReset());

describe("linkTreeApi", () => {
  const payload = { title: "T", type: "public", description: "D" };

  it("create", () => {
    linkTreeApi.create(payload);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees", { method: "POST", body: payload });
  });

  it("uploadCover memakai FormData field cover", () => {
    linkTreeApi.uploadCover(3, new File(["x"], "c.png"));
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/link-trees/3/cover");
    expect(options.method).toBe("POST");
    expect(options.formData.get("cover")).toBeInstanceOf(File);
  });

  it("update", () => {
    linkTreeApi.update(3, payload);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/3", { method: "PUT", body: payload });
  });

  it("getAll tanpa filter", () => {
    linkTreeApi.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/link-trees", { query: {} });
  });

  it("getAll dengan is_me=1", () => {
    linkTreeApi.getAll(true);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees", { query: { is_me: 1 } });
  });

  it("getById", () => {
    linkTreeApi.getById(3);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/3");
  });

  it("remove", () => {
    linkTreeApi.remove(3);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/3", { method: "DELETE" });
  });

  it("removeAll", () => {
    linkTreeApi.removeAll();
    expect(apiFetch).toHaveBeenCalledWith("/link-trees", { method: "DELETE" });
  });

  it("addItem", () => {
    linkTreeApi.addItem(3, { title: "A", url: "https://a.test" });
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/3/items", {
      method: "POST",
      body: { title: "A", url: "https://a.test" },
    });
  });

  it("updateItem", () => {
    linkTreeApi.updateItem(3, 9, { title: "B", url: "https://b.test" });
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/3/items/9", {
      method: "PUT",
      body: { title: "B", url: "https://b.test" },
    });
  });

  it("removeItem", () => {
    linkTreeApi.removeItem(3, 9);
    expect(apiFetch).toHaveBeenCalledWith("/link-trees/3/items/9", { method: "DELETE" });
  });
});
