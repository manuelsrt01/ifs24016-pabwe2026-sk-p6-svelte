import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

vi.mock("../states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  changeLinkTree: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import ChangeModal from "./ChangeModal.svelte";
import { changeLinkTree, isChanging } from "../states/linkTreesStore.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";

const linkTree = { id: 5, title: "Lama", type: "unlisted", description: "Deskripsi lama" };
const submit = () => screen.getByRole("button", { name: "Simpan perubahan" }).click();

beforeEach(() => {
  vi.resetAllMocks();
  isChanging.set(false);
});

describe("ChangeModal", () => {
  it("tidak tampil saat tertutup", () => {
    render(ChangeModal, { props: { open: false, linkTree, onClose: vi.fn() } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mengisi formulir dari data saat dibuka", async () => {
    const onClose = vi.fn();
    const { rerender } = render(ChangeModal, { props: { open: false, linkTree, onClose } });
    await rerender({ open: true, linkTree, onClose });

    await waitFor(() => expect(screen.getByLabelText("Judul")).toHaveValue("Lama"));
    expect(screen.getByLabelText("Jenis")).toHaveValue("unlisted");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Deskripsi lama");
  });

  it("menolak judul kosong", async () => {
    render(ChangeModal, { props: { open: true, linkTree, onClose: vi.fn() } });
    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "  " } });
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Judul dan deskripsi wajib diisi.")
    );
    expect(changeLinkTree).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan lalu menutup", async () => {
    changeLinkTree.mockResolvedValue({ ok: true, message: "Diubah" });
    const onClose = vi.fn();
    render(ChangeModal, { props: { open: true, linkTree, onClose } });

    await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: " Baru " } });
    await fireEvent.change(screen.getByLabelText("Jenis"), { target: { value: "public" } });
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(changeLinkTree).toHaveBeenCalledWith(5, {
      title: "Baru",
      type: "public",
      description: "Deskripsi lama",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Diubah");
  });

  it("menampilkan dialog error saat gagal", async () => {
    changeLinkTree.mockResolvedValue({ ok: false, message: "Gagal ubah" });
    const onClose = vi.fn();
    render(ChangeModal, { props: { open: true, linkTree, onClose } });
    submit();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal ubah"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol Batal", () => {
    const onClose = vi.fn();
    render(ChangeModal, { props: { open: true, linkTree, onClose } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status menyimpan", () => {
    isChanging.set(true);
    render(ChangeModal, { props: { open: true, linkTree, onClose: vi.fn() } });
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
});
