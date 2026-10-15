import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";
import LinkTreeCard from "./LinkTreeCard.svelte";

const base = {
  id: 7,
  title: "Tautan Saya",
  description: "Deskripsi singkat",
  type: "unlisted",
  cover: "http://x.test/img/c.jpg",
  total_links: 3,
  author: { name: "Ana" },
};

describe("LinkTreeCard", () => {
  it("menampilkan cover, judul, jenis, penulis, dan jumlah tautan", () => {
    renderWithProviders(LinkTreeCard, {
      props: { linkTree: base, onDelete: vi.fn() },
    });
    expect(screen.getByAltText("Cover Tautan Saya")).toHaveAttribute(
      "src",
      "http://x.test/img/c.jpg",
    );
    expect(screen.getByText("Tautan Saya")).toBeInTheDocument();
    expect(screen.getByText("Tidak Terdaftar")).toBeInTheDocument();
    expect(screen.getByText(/Ana · 3 tautan/)).toBeInTheDocument();
  });

  it("memakai placeholder bila tidak ada cover", () => {
    renderWithProviders(LinkTreeCard, {
      props: {
        linkTree: { ...base, cover: "http://localhost:8000/" },
        onDelete: vi.fn(),
      },
    });
    expect(screen.queryByAltText("Cover Tautan Saya")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);
  });

  it("menyembunyikan tombol hapus untuk non-pemilik", () => {
    renderWithProviders(LinkTreeCard, {
      props: { linkTree: base, onDelete: vi.fn() },
    });
    expect(
      screen.queryByRole("button", { name: "Hapus Tautan Saya" }),
    ).not.toBeInTheDocument();
  });

  it("memanggil onDelete saat pemilik menekan hapus", () => {
    const onDelete = vi.fn();
    renderWithProviders(LinkTreeCard, {
      props: { linkTree: base, isOwner: true, onDelete },
    });
    screen.getByRole("button", { name: "Hapus Tautan Saya" }).click();
    expect(onDelete).toHaveBeenCalledWith(base);
  });

  it("berpindah ke detail lewat gambar dan judul", async () => {
    const { container } = renderWithProviders(LinkTreeCard, {
      props: { linkTree: base, onDelete: vi.fn() },
    });
    const [imageLink, titleLink] = container.querySelectorAll("a");

    imageLink.click();
    await waitFor(() => expect(get(currentPath)).toBe("/link-trees/7"));

    currentPath.set("/");
    titleLink.click();
    await waitFor(() => expect(get(currentPath)).toBe("/link-trees/7"));
  });

  it("menampilkan 0 tautan bila total_links tidak ada", () => {
    renderWithProviders(LinkTreeCard, {
      props: {
        linkTree: { ...base, total_links: undefined },
        onDelete: vi.fn(),
      },
    });
    expect(screen.getByText(/Ana · 0 tautan/)).toBeInTheDocument();
  });

  it("memberi nama yang terbaca pada tautan gambar, baik dengan maupun tanpa cover", () => {
    const { unmount } = renderWithProviders(LinkTreeCard, {
      props: { linkTree: base, onDelete: vi.fn() },
    });
    expect(
      screen.getByRole("link", { name: "Buka Tautan Saya" }),
    ).toHaveAttribute("href", "/link-trees/7");
    unmount();

    renderWithProviders(LinkTreeCard, {
      props: { linkTree: { ...base, cover: "" }, onDelete: vi.fn() },
    });
    expect(
      screen.getByRole("link", { name: "Buka Tautan Saya" }),
    ).toBeInTheDocument();
  });
});
