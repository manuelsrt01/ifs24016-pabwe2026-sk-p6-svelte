import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { renderWithProviders } from "../../../test-utils.js";
import LinkTreeLayout from "./LinkTreeLayout.svelte";

const children = createRawSnippet(() => ({ render: () => "<p>Isi halaman</p>" }));
const render = () =>
  renderWithProviders(LinkTreeLayout, {
    path: "/",
    authToken: "t",
    user: { id: 1, name: "Ana", email: "a@x.id", photo: null },
    props: { children },
  });

describe("LinkTreeLayout", () => {
  it("merender navbar, sidebar, dan konten", () => {
    render();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByText("Isi halaman")).toBeInTheDocument();
  });

  it("membuka dan menutup sidebar lewat tombol menu", async () => {
    render();
    const aside = screen.getByRole("complementary");
    expect(aside).toHaveClass("-translate-x-full");

    screen.getByRole("button", { name: "Buka menu" }).click();
    await waitFor(() => expect(aside).not.toHaveClass("-translate-x-full"));

    screen.getByRole("button", { name: "Buka menu" }).click();
    await waitFor(() => expect(aside).toHaveClass("-translate-x-full"));
  });

  it("menutup sidebar setelah memilih menu", async () => {
    render();
    const aside = screen.getByRole("complementary");
    screen.getByRole("button", { name: "Buka menu" }).click();
    await waitFor(() => expect(aside).not.toHaveClass("-translate-x-full"));

    screen.getByRole("link", { name: "Pengguna" }).click();
    await waitFor(() => expect(aside).toHaveClass("-translate-x-full"));
  });
});
