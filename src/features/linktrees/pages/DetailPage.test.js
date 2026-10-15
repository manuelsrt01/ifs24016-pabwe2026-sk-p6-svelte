import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";

vi.mock("../states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchLinkTree: vi.fn(),
  clearLinkTree: vi.fn(),
  removeLinkTree: vi.fn(),
  removeItem: vi.fn(),
  changeCover: vi.fn(),
  addItem: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import DetailPage from "./DetailPage.svelte";
import {
  linkTree,
  linkTreeError,
  fetchLinkTree,
  clearLinkTree,
  removeLinkTree,
  removeItem,
  changeCover,
  addItem,
} from "../states/linkTreesStore.js";
import {
  showConfirmDialog,
  showSuccessDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper.js";

const detail = (over = {}) => ({
  id: 5,
  user_id: 1,
  title: "Tautan Saya",
  description: "Deskripsi detail",
  type: "public",
  cover: "http://x.test/img/c.jpg",
  created_at: "2025-03-09T01:32:33.000000Z",
  author: { name: "Ana" },
  items: [{ id: 9, title: "GitHub", url: "https://github.com" }],
  ...over,
});
const owner = { id: 1, name: "Ana", email: "a@x.id", photo: null };
const stranger = { id: 2, name: "Budi", email: "b@x.id", photo: null };

const render = (user = owner, params = { linkTreeId: "5" }) =>
  renderWithProviders(DetailPage, {
    path: "/link-trees/5",
    authToken: "t",
    user,
    props: { params },
  });

beforeEach(() => {
  vi.resetAllMocks();
  linkTree.set(null);
  linkTreeError.set(null);
});

describe("DetailPage - pemuatan", () => {
  it("memuat detail, menampilkan loading, lalu membersihkan saat dilepas", () => {
    const { unmount } = render();
    expect(fetchLinkTree).toHaveBeenCalledWith("5");
    expect(screen.getByText("Memuat detail...")).toBeInTheDocument();
    unmount();
    expect(clearLinkTree).toHaveBeenCalled();
  });

  it("memuat ulang saat parameter berubah", async () => {
    const { rerender } = render();
    await rerender({ params: { linkTreeId: "6" } });
    await waitFor(() => expect(fetchLinkTree).toHaveBeenLastCalledWith("6"));
  });

  it("menampilkan error bila detail tidak ada", () => {
    linkTreeError.set("Tidak ditemukan");
    render();
    expect(screen.getByRole("alert")).toHaveTextContent("Tidak ditemukan");
  });

  it("tetap menampilkan detail bila ada error tetapi data masih ada", () => {
    linkTree.set(detail());
    linkTreeError.set("Gagal menyegarkan");
    render();
    expect(
      screen.getByRole("heading", { name: "Tautan Saya" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("kembali ke beranda lewat tautan Kembali", async () => {
    render();
    screen.getByRole("link", { name: "Kembali" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/"));
  });
});

describe("DetailPage - konten", () => {
  it("menampilkan detail, cover, dan tautan untuk pemilik", () => {
    linkTree.set(detail());
    render();
    expect(screen.getByAltText("Cover Tautan Saya")).toBeInTheDocument();
    expect(screen.getByText(/Oleh Ana/)).toBeInTheDocument();
    expect(screen.getByText("Deskripsi detail")).toBeInTheDocument();
    expect(screen.getByText("Tautan (1)")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /GitHub/ });
    expect(link).toHaveAttribute("href", "https://github.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("button", { name: "Ubah Data" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tambah Tautan" }),
    ).toBeInTheDocument();
  });

  it("menyembunyikan aksi bagi non-pemilik", () => {
    linkTree.set(detail());
    render(stranger);
    expect(
      screen.queryByRole("button", { name: "Ubah Data" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Tambah Tautan" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ubah GitHub" }),
    ).not.toBeInTheDocument();
  });

  it("menyembunyikan aksi saat profil belum dimuat", () => {
    linkTree.set(detail());
    render(null);
    expect(
      screen.queryByRole("button", { name: "Ubah Data" }),
    ).not.toBeInTheDocument();
  });

  it("memakai gradien tanpa cover dan menangani item kosong", () => {
    linkTree.set(detail({ cover: "", items: undefined }));
    render();
    expect(screen.queryByAltText("Cover Tautan Saya")).not.toBeInTheDocument();
    expect(screen.getByText("Tautan (0)")).toBeInTheDocument();
    expect(screen.getByText("Belum ada tautan.")).toBeInTheDocument();
  });
});

describe("DetailPage - modal", () => {
  beforeEach(() => linkTree.set(detail()));

  const closeDialog = async () => {
    within(screen.getByRole("dialog"))
      .getByRole("button", { name: "Batal" })
      .click();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  };

  it("membuka dan menutup modal ubah data", async () => {
    render();
    screen.getByRole("button", { name: "Ubah Data" }).click();
    expect(
      await screen.findByRole("heading", { name: "Ubah Link Tree" }),
    ).toBeInTheDocument();
    await closeDialog();
  });

  it("membuka dan menutup modal ubah cover", async () => {
    render();
    screen.getByRole("button", { name: "Ubah Cover" }).click();
    expect(
      await screen.findByRole("heading", { name: "Ubah Cover" }),
    ).toBeInTheDocument();
    await closeDialog();
  });

  it("membuka modal ubah tautan lalu modal tambah tautan", async () => {
    render();
    screen.getByRole("button", { name: "Ubah GitHub" }).click();
    expect(
      await screen.findByRole("heading", { name: "Ubah Tautan" }),
    ).toBeInTheDocument();
    await closeDialog();

    screen.getByRole("button", { name: "Tambah Tautan" }).click();
    expect(
      await screen.findByRole("heading", { name: "Tambah Tautan" }),
    ).toBeInTheDocument();
    await closeDialog();
  });
});

describe("DetailPage - mengirim modal", () => {
  beforeEach(() => linkTree.set(detail()));

  it("mengunggah cover dengan id Link Tree yang sedang dibuka", async () => {
    changeCover.mockResolvedValue({ ok: true, message: "Cover diubah" });
    render();
    screen.getByRole("button", { name: "Ubah Cover" }).click();
    const dialog = await screen.findByRole("dialog");

    const file = new File(["x"], "c.png", { type: "image/png" });
    await fireEvent.change(within(dialog).getByLabelText("Gambar cover"), {
      target: { files: [file] },
    });
    within(dialog).getByRole("button", { name: "Unggah" }).click();

    await waitFor(() => expect(changeCover).toHaveBeenCalledWith(5, file));
    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Cover diubah"),
    );
  });

  it("menambah tautan dengan id Link Tree yang sedang dibuka", async () => {
    addItem.mockResolvedValue({ ok: true, message: "Tautan ditambah" });
    render();
    screen.getByRole("button", { name: "Tambah Tautan" }).click();
    const dialog = await screen.findByRole("dialog");

    await fireEvent.input(within(dialog).getByLabelText("Judul tautan"), {
      target: { value: "Situs" },
    });
    await fireEvent.input(within(dialog).getByLabelText("URL"), {
      target: { value: "https://situs.test" },
    });
    within(dialog).getByRole("button", { name: "Simpan" }).click();

    await waitFor(() =>
      expect(addItem).toHaveBeenCalledWith(5, {
        title: "Situs",
        url: "https://situs.test",
      }),
    );
    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Tautan ditambah"),
    );
  });
});

describe("DetailPage - hapus tautan", () => {
  beforeEach(() => linkTree.set(detail()));

  it("membatalkan bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    render();
    screen.getByRole("button", { name: "Hapus GitHub" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(removeItem).not.toHaveBeenCalled();
  });

  it("menghapus tautan dan menampilkan dialog sukses", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeItem.mockResolvedValue({ ok: true, message: "Tautan dihapus" });
    render();
    screen.getByRole("button", { name: "Hapus GitHub" }).click();
    await waitFor(() =>
      expect(showSuccessDialog).toHaveBeenCalledWith("Tautan dihapus"),
    );
    expect(removeItem).toHaveBeenCalledWith(5, 9);
  });

  it("menampilkan dialog error saat gagal", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeItem.mockResolvedValue({ ok: false, message: "Gagal hapus tautan" });
    render();
    screen.getByRole("button", { name: "Hapus GitHub" }).click();
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus tautan"),
    );
  });
});

describe("DetailPage - hapus Link Tree", () => {
  beforeEach(() => linkTree.set(detail()));

  it("membatalkan bila konfirmasi ditolak", async () => {
    showConfirmDialog.mockResolvedValue(false);
    render();
    screen.getByRole("button", { name: "Hapus" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(removeLinkTree).not.toHaveBeenCalled();
  });

  it("menghapus lalu kembali ke beranda", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeLinkTree.mockResolvedValue({
      ok: true,
      message: "Link Tree dihapus",
    });
    render();
    screen.getByRole("button", { name: "Hapus" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/"));
    expect(removeLinkTree).toHaveBeenCalledWith(5);
    expect(showSuccessDialog).toHaveBeenCalledWith("Link Tree dihapus");
  });

  it("menampilkan dialog error dan tetap di halaman saat gagal", async () => {
    showConfirmDialog.mockResolvedValue(true);
    removeLinkTree.mockResolvedValue({
      ok: false,
      message: "Gagal hapus tree",
    });
    render();
    screen.getByRole("button", { name: "Hapus" }).click();
    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus tree"),
    );
    expect(get(currentPath)).toBe("/link-trees/5");
  });
});
