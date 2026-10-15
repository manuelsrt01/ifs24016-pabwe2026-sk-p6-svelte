import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

vi.mock("../states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  addLinkTree: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import AddModal from "./AddModal.svelte";
import { addLinkTree, isAdding } from "../states/linkTreesStore.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";

const fill = async (title, description, type) => {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: title } });
  await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: description } });
  if (type) await fireEvent.change(screen.getByLabelText("Jenis"), { target: { value: type } });
};
const submit = () => screen.getByRole("button", { name: "Simpan" }).click();

beforeEach(() => {
  vi.resetAllMocks();
  isAdding.set(false);
});

describe("AddModal", () => {
  it("tidak tampil saat tertutup", () => {
    render(AddModal, { props: { open: false, onClose: vi.fn() } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menolak judul atau deskripsi kosong", async () => {
    render(AddModal, { props: { open: true, onClose: vi.fn() } });
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Judul dan deskripsi wajib diisi.")
    );
    expect(addLinkTree).not.toHaveBeenCalled();
  });

  it("menyimpan lalu menutup dan mengosongkan formulir", async () => {
    addLinkTree.mockResolvedValue({ ok: true, message: "Dibuat" });
    const onClose = vi.fn();
    const { rerender } = render(AddModal, { props: { open: true, onClose } });

    await fill("  Judul Baru ", " Deskripsi ", "private");
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(addLinkTree).toHaveBeenCalledWith({ title: "Judul Baru", type: "private", description: "Deskripsi" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Dibuat");

    await rerender({ open: false, onClose });
    await rerender({ open: true, onClose });
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    expect(screen.getByLabelText("Jenis")).toHaveValue("public");
  });

  it("menampilkan dialog error dan tetap terbuka saat gagal", async () => {
    addLinkTree.mockResolvedValue({ ok: false, message: "Gagal" });
    const onClose = vi.fn();
    render(AddModal, { props: { open: true, onClose } });

    await fill("Judul", "Deskripsi");
    submit();

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup dan menghapus pesan error lewat tombol Batal", async () => {
    const onClose = vi.fn();
    render(AddModal, { props: { open: true, onClose } });
    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    screen.getByRole("button", { name: "Batal" }).click();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("menampilkan status menyimpan", () => {
    isAdding.set(true);
    render(AddModal, { props: { open: true, onClose: vi.fn() } });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
