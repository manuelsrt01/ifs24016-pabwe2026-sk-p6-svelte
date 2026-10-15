import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";
import NotFoundPage from "./NotFoundPage.svelte";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404", () => {
    renderWithProviders(NotFoundPage, { path: "/tidak-ada" });
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
  });

  it("kembali ke beranda saat tautan diklik", async () => {
    renderWithProviders(NotFoundPage, { path: "/tidak-ada" });
    screen.getByRole("link", { name: "Kembali ke beranda" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/"));
  });
});
