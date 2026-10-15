import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../states/usersStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  updateProfile: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

import ProfilePage from "./ProfilePage.svelte";
import { profile } from "../../auth/states/authStore.js";
import {
  updateProfile,
  uploadPhoto,
  changePassword,
  isUpdatingProfile,
  isUploadingPhoto,
  isChangingPassword,
} from "../states/usersStore.js";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";

const origin = new URL(DELCOM_BASEURL).origin;
const user = { id: 1, name: "Ana", email: "ana@x.id", photo: null };
const opts = (u = user) => ({ path: "/profile", authToken: "t", user: u });

const setValue = (label, value) =>
  fireEvent.input(screen.getByLabelText(label), { target: { value } });
const clickButton = (name) => screen.getByRole("button", { name }).click();
const alertText = (text) => waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(text));
const pickFile = (file) =>
  fireEvent.change(screen.getByLabelText("Pilih foto baru"), { target: { files: [file] } });

beforeEach(() => {
  vi.resetAllMocks();
  isUpdatingProfile.set(false);
  isUploadingPhoto.set(false);
  isChangingPassword.set(false);
});

describe("ProfilePage - data profil", () => {
  it("mengisi formulir dari profil yang sudah ada", () => {
    renderWithProviders(ProfilePage, opts());
    expect(screen.getByLabelText("Nama")).toHaveValue("Ana");
    expect(screen.getByLabelText("Email")).toHaveValue("ana@x.id");
  });

  it("mengisi formulir setelah profil baru tersedia", async () => {
    renderWithProviders(ProfilePage, opts(null));
    expect(screen.getByLabelText("Nama")).toHaveValue("");
    profile.set(user);
    await waitFor(() => expect(screen.getByLabelText("Nama")).toHaveValue("Ana"));
  });

  it("menolak nama atau email kosong", async () => {
    renderWithProviders(ProfilePage, opts());
    await setValue("Nama", "");
    clickButton("Simpan Profil");
    await alertText("Nama dan email wajib diisi.");
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("menolak email tidak valid", async () => {
    renderWithProviders(ProfilePage, opts());
    await setValue("Email", "salah");
    clickButton("Simpan Profil");
    await alertText("Format email tidak valid.");
  });

  it("menyimpan profil dan menampilkan dialog sukses", async () => {
    updateProfile.mockResolvedValue({ ok: true, message: "Tersimpan" });
    renderWithProviders(ProfilePage, opts());
    await setValue("Nama", " Ana Baru ");
    clickButton("Simpan Profil");
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Tersimpan"));
    expect(updateProfile).toHaveBeenCalledWith({ name: "Ana Baru", email: "ana@x.id" });
  });

  it("menampilkan dialog error saat gagal menyimpan", async () => {
    updateProfile.mockResolvedValue({ ok: false, message: "Gagal simpan" });
    renderWithProviders(ProfilePage, opts());
    clickButton("Simpan Profil");
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Gagal simpan"));
  });
});

describe("ProfilePage - foto", () => {
  it("memakai foto bawaan bila profil kosong atau tanpa foto", () => {
    const { unmount } = renderWithProviders(ProfilePage, opts(null));
    expect(screen.getByAltText("Foto profil saat ini")).toHaveAttribute("src", `${origin}/default/img/user.png`);
    unmount();

    renderWithProviders(ProfilePage, opts());
    expect(screen.getByAltText("Foto profil saat ini")).toHaveAttribute("src", `${origin}/default/img/user.png`);
  });

  it("memakai foto profil bila tersedia", () => {
    renderWithProviders(ProfilePage, opts({ ...user, photo: "img/p.png" }));
    expect(screen.getByAltText("Foto profil saat ini")).toHaveAttribute("src", `${origin}/img/p.png`);
  });

  it("menolak unggah tanpa memilih foto", async () => {
    renderWithProviders(ProfilePage, opts());
    clickButton("Unggah Foto");
    await alertText("Pilih foto terlebih dahulu.");
    expect(uploadPhoto).not.toHaveBeenCalled();
  });

  it("menolak berkas yang bukan gambar", async () => {
    renderWithProviders(ProfilePage, opts());
    await pickFile(new File(["x"], "a.txt", { type: "text/plain" }));
    clickButton("Unggah Foto");
    await alertText("Berkas harus berupa gambar.");
    expect(uploadPhoto).not.toHaveBeenCalled();
  });

  it("mengunggah foto dan menampilkan dialog sukses", async () => {
    uploadPhoto.mockResolvedValue({ ok: true, message: "Foto diubah" });
    renderWithProviders(ProfilePage, opts());
    const file = new File(["x"], "a.png", { type: "image/png" });
    await pickFile(file);
    clickButton("Unggah Foto");
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Foto diubah"));
    expect(uploadPhoto).toHaveBeenCalledWith(file);
  });

  it("menampilkan dialog error saat unggah gagal", async () => {
    uploadPhoto.mockResolvedValue({ ok: false, message: "Unggah gagal" });
    renderWithProviders(ProfilePage, opts());
    await pickFile(new File(["x"], "a.png", { type: "image/png" }));
    clickButton("Unggah Foto");
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Unggah gagal"));
  });
});

describe("ProfilePage - kata sandi", () => {
  const fillPasswords = async (current, next, confirm) => {
    await setValue("Kata sandi saat ini", current);
    await setValue("Kata sandi baru", next);
    await setValue("Konfirmasi kata sandi baru", confirm);
  };

  it("menolak kolom kosong", async () => {
    renderWithProviders(ProfilePage, opts());
    clickButton("Ubah Kata Sandi");
    await alertText("Semua kolom kata sandi wajib diisi.");
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("menolak kata sandi baru yang pendek", async () => {
    renderWithProviders(ProfilePage, opts());
    await fillPasswords("lama123", "123", "123");
    clickButton("Ubah Kata Sandi");
    await alertText("Kata sandi baru minimal 6 karakter.");
  });

  it("menolak konfirmasi yang berbeda", async () => {
    renderWithProviders(ProfilePage, opts());
    await fillPasswords("lama123", "baru123", "beda123");
    clickButton("Ubah Kata Sandi");
    await alertText("Konfirmasi kata sandi baru tidak sama.");
  });

  it("mengubah kata sandi lalu mengosongkan kolom", async () => {
    changePassword.mockResolvedValue({ ok: true, message: "Sandi diubah" });
    renderWithProviders(ProfilePage, opts());
    await fillPasswords("lama123", "baru123", "baru123");
    clickButton("Ubah Kata Sandi");

    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith("Sandi diubah"));
    expect(changePassword).toHaveBeenCalledWith({
      password: "lama123",
      new_password: "baru123",
      new_password_confirmation: "baru123",
    });
    await waitFor(() => expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue(""));
    expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("");
    expect(screen.getByLabelText("Konfirmasi kata sandi baru")).toHaveValue("");
  });

  it("mempertahankan isian saat gagal mengubah kata sandi", async () => {
    changePassword.mockResolvedValue({ ok: false, message: "Sandi salah" });
    renderWithProviders(ProfilePage, opts());
    await fillPasswords("lama123", "baru123", "baru123");
    clickButton("Ubah Kata Sandi");

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Sandi salah"));
    expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("lama123");
  });
});

describe("ProfilePage - status loading", () => {
  it("menampilkan teks proses pada ketiga tombol", () => {
    isUpdatingProfile.set(true);
    isUploadingPhoto.set(true);
    isChangingPassword.set(true);
    renderWithProviders(ProfilePage, opts());
    expect(screen.getAllByText("Menyimpan...")).toHaveLength(2);
    expect(screen.getByText("Mengunggah...")).toBeInTheDocument();
  });
});
