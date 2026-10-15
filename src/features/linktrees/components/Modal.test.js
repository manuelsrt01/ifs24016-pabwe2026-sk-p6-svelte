import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import Modal from "./Modal.svelte";

const children = createRawSnippet(() => ({ render: () => "<p>Isi modal</p>" }));

describe("Modal", () => {
  it("tidak merender apa pun saat tertutup", () => {
    render(Modal, { props: { open: false, title: "Judul", onClose: vi.fn(), children } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("merender judul dan isi saat terbuka", () => {
    render(Modal, { props: { open: true, title: "Judul", onClose: vi.fn(), children } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Judul" })).toBeInTheDocument();
    expect(screen.getByText("Isi modal")).toBeInTheDocument();
  });

  it("memanggil onClose dari latar dan tombol tutup", () => {
    const onClose = vi.fn();
    render(Modal, { props: { open: true, title: "Judul", onClose, children } });
    screen.getByRole("button", { name: "Tutup latar" }).click();
    screen.getByRole("button", { name: "Tutup modal" }).click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
