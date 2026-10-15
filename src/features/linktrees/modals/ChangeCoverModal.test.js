import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

vi.mock("../states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  changeCover: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { changeCover, isChangingCover } from "../states/linkTreesStore.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";

const pick = (file) => fireEvent.change(screen.getByLabelText("Gambar cover"), { target: { files: [file] } });
const submit = () => screen.getByRole("button", { name: "Unggah" }).click();
const image = () => new File(["x"], "c.png", { type: "image/png" });

beforeEach(() => {
  vi.resetAllMocks();
  isChangingCover.set(false);
});

describe("ChangeCoverModal", () => {
  it("tidak tampil saat tertutup", () => {
    render(ChangeCoverModal, { props: { open: false, linkTreeId: 5, onClose: vi.fn() } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menolak unggah tanpa berkas", async () => {
    render(ChangeCoverModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Pilih gambar cover terlebih dahulu.")
    );
    expect(changeCover).not.toHaveBeenCalled();
  });

  it("menolak berkas yang bukan gambar", async () => {
    render(ChangeCoverModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    await pick(new File(["x"], "a.txt", { type: "text/plain" }));
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Berkas harus berupa gambar.")
    );
  });

  it("menampilkan nama berkas, mengunggah, lalu menutup", async () => {
    changeCover.mockResolvedValue({ ok: true, message: "Cover diubah" });
    const onClose = vi.fn();
    render(ChangeCoverModal, { props: { open: true, linkTreeId: 5, onClose } });

    expect(screen.queryByText(/Dipilih:/)).not.toBeInTheDocument();
    const file = image();
    await pick(file);
    expect(screen.getByText("Dipilih: c.png")).toBeInTheDocument();

    submit();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(changeCover).toHaveBeenCalledWith(5, file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Cover diubah");
  });

  it("menampilkan dialog error saat gagal", async () => {
    changeCover.mockResolvedValue({ ok: false, message: "Gagal unggah" });
    const onClose = vi.fn();
    render(ChangeCoverModal, { props: { open: true, linkTreeId: 5, onClose } });
    await pick(image());
    submit();
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal unggah"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol Batal", () => {
    const onClose = vi.fn();
    render(ChangeCoverModal, { props: { open: true, linkTreeId: 5, onClose } });
    screen.getByRole("button", { name: "Batal" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status mengunggah", () => {
    isChangingCover.set(true);
    render(ChangeCoverModal, { props: { open: true, linkTreeId: 5, onClose: vi.fn() } });
    expect(screen.getByRole("button", { name: "Mengunggah..." })).toBeDisabled();
  });
});
