import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

vi.mock("../states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  addItem: vi.fn(),
  changeItem: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import ItemModal from "./ItemModal.svelte";
import { addItem, changeItem, isMutatingItem } from "../states/linkTreesStore.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";

const item = { id: 9, title: "GitHub", url: "https://github.com" };
const fill = async (title, url) => {
  await fireEvent.input(screen.getByLabelText("Judul tautan"), { target: { value: title } });
  await fireEvent.input(screen.getByLabelText("URL"), { target: { value: url } });
};
const submit = () => screen.getByRole("button", { name: "Simpan" }).click();
const alertText = (text) => waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(text));

beforeEach(() => {
  vi.resetAllMocks();
  isMutatingItem.set(false);
});

describe("ItemModal - tambah", () => {
  it("tidak tampil saat tertutup", () => {
    render(ItemModal, { props: { open: false, linkTreeId: 5, onClose: vi.fn() } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menampilkan judul tambah dan formulir kosong", () => {
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    expect(screen.getByRole("heading", { name: "Tambah Tautan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul tautan")).toHaveValue("");
    expect(screen.getByLabelText("URL")).toHaveValue("");
  });

  it("menolak judul atau URL kosong", async () => {
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    submit();
    await alertText("Judul dan URL wajib diisi.");
    expect(addItem).not.toHaveBeenCalled();
  });

  it("menolak URL tidak valid", async () => {
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    await fill("Situs", "bukan-url");
    submit();
    await alertText("URL harus diawali http:// atau https://.");
  });

  it("menambah tautan lalu menutup", async () => {
    addItem.mockResolvedValue({ ok: true, message: "Ditambah" });
    const onClose = vi.fn();
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose } });
    await fill(" Situs ", " https://situs.test ");
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(addItem).toHaveBeenCalledWith(5, { title: "Situs", url: "https://situs.test" });
    expect(changeItem).not.toHaveBeenCalled();
    expect(showSuccessDialog).toHaveBeenCalledWith("Ditambah");
  });

  it("menampilkan dialog error saat gagal", async () => {
    addItem.mockResolvedValue({ ok: false, message: "Gagal tambah" });
    const onClose = vi.fn();
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose } });
    await fill("Situs", "https://situs.test");
    submit();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal tambah"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ItemModal - ubah", () => {
  it("mengisi formulir dari item saat dibuka", async () => {
    const onClose = vi.fn();
    const { rerender } = render(ItemModal, { props: { open: false, linkTreeId: 5, item, onClose } });
    await rerender({ open: true, linkTreeId: 5, item, onClose });

    expect(screen.getByRole("heading", { name: "Ubah Tautan" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Judul tautan")).toHaveValue("GitHub"));
    expect(screen.getByLabelText("URL")).toHaveValue("https://github.com");
  });

  it("mengubah tautan lalu menutup", async () => {
    changeItem.mockResolvedValue({ ok: true, message: "Diubah" });
    const onClose = vi.fn();
    render(ItemModal, { props: { open: true, linkTreeId: 5, item, onClose } });
    await fill("GitHub Baru", "https://github.com/baru");
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(changeItem).toHaveBeenCalledWith(5, 9, { title: "GitHub Baru", url: "https://github.com/baru" });
    expect(addItem).not.toHaveBeenCalled();
  });
});

describe("ItemModal - umum", () => {
  it("menutup lewat tombol Batal", () => {
    const onClose = vi.fn();
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status menyimpan", () => {
    isMutatingItem.set(true);
    render(ItemModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
