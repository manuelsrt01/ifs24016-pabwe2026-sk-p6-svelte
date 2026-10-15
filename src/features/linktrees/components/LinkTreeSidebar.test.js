import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";
import LinkTreeSidebar from "./LinkTreeSidebar.svelte";

const render = (path, open = false, onClose = vi.fn()) =>
  renderWithProviders(LinkTreeSidebar, { path, props: { open, onClose } });

const active = () =>
  screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page")
    .map((link) => link.textContent.trim());

describe("LinkTreeSidebar", () => {
  it("menampilkan tiga menu", () => {
    render("/");
    expect(screen.getByRole("link", { name: "Semua Link Tree" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pengguna" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profil" })).toBeInTheDocument();
  });

  it("tersembunyi saat tertutup dan tampil saat terbuka", () => {
    const { unmount } = render("/", false);
    expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
    unmount();

    render("/", true);
    expect(screen.getByRole("complementary")).not.toHaveClass("-translate-x-full");
  });

  it("menandai menu aktif sesuai path", () => {
    const first = render("/");
    expect(active()).toEqual(["Semua Link Tree"]);
    first.unmount();

    const second = render("/link-trees/5");
    expect(active()).toEqual(["Semua Link Tree"]);
    second.unmount();

    const third = render("/users");
    expect(active()).toEqual(["Pengguna"]);
    third.unmount();

    render("/profile");
    expect(active()).toEqual(["Profil"]);
  });

  it("berpindah halaman dan menutup sidebar saat menu diklik", async () => {
    const onClose = vi.fn();
    render("/", true, onClose);
    screen.getByRole("link", { name: "Pengguna" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/users"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
