import { describe, it, expect, vi } from "vitest";
import { get } from "svelte/store";
import { currentPath, navigate, resolveRoute, handleLinkClick } from "./router.js";

describe("navigate", () => {
  it("push history dan memperbarui currentPath", () => {
    navigate("/users");
    expect(window.location.pathname).toBe("/users");
    expect(get(currentPath)).toBe("/users");
  });

  it("replace history bila replace true", () => {
    const spy = vi.spyOn(window.history, "replaceState");
    navigate("/profile", { replace: true });
    expect(spy).toHaveBeenCalled();
    expect(get(currentPath)).toBe("/profile");
    spy.mockRestore();
  });

  it("mengikuti event popstate", () => {
    window.history.pushState({}, "", "/auth/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(get(currentPath)).toBe("/auth/login");
  });
});

describe("handleLinkClick", () => {
  it("mencegah aksi default dan berpindah halaman", () => {
    const event = { preventDefault: vi.fn() };
    handleLinkClick(event, "/users");
    expect(event.preventDefault).toHaveBeenCalled();
    expect(get(currentPath)).toBe("/users");
  });
});

describe("resolveRoute", () => {
  it.each([
    ["/auth/login", "login", "auth"],
    ["/auth/register", "register", "auth"],
    ["/", "home", "app"],
    ["/users", "users", "app"],
    ["/profile", "profile", "app"],
  ])("memetakan %s", (path, name, layout) => {
    expect(resolveRoute(path)).toEqual({ name, layout, params: {} });
  });

  it("mengabaikan slash di akhir path", () => {
    expect(resolveRoute("/users/").name).toBe("users");
  });

  it("memetakan path kosong ke beranda", () => {
    expect(resolveRoute("").name).toBe("home");
  });

  it("membaca parameter linkTreeId", () => {
    expect(resolveRoute("/link-trees/12")).toEqual({
      name: "detail",
      layout: "app",
      params: { linkTreeId: "12" },
    });
  });

  it.each(["/link-trees", "/link-trees/", "/link-trees/1/extra", "/tidak-ada"])(
    "menampilkan not-found untuk %s",
    (path) => {
      expect(resolveRoute(path)).toEqual({ name: "not-found", layout: "none", params: {} });
    }
  );
});
