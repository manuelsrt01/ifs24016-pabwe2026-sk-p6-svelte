import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";

vi.mock("../states/authStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  register: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import RegisterPage from "./RegisterPage.svelte";
import { register, authLoading } from "../states/authStore.js";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";

const fill = async ({ name = "", email = "", password = "", confirmation = "" }) => {
  await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: name } });
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: email } });
  await fireEvent.input(screen.getByLabelText("Kata sandi"), { target: { value: password } });
  await fireEvent.input(screen.getByLabelText("Konfirmasi kata sandi"), { target: { value: confirmation } });
};
const submit = () => screen.getByRole("button", { name: "Daftar" }).click();
const expectAlert = (text) =>
  waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(text));

beforeEach(() => {
  vi.resetAllMocks();
  authLoading.set(false);
});

describe("RegisterPage", () => {
  it("menolak kolom kosong", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    submit();
    await expectAlert("Semua kolom wajib diisi.");
    expect(register).not.toHaveBeenCalled();
  });

  it("menolak email tidak valid", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await fill({ name: "Ana", email: "salah", password: "123456", confirmation: "123456" });
    submit();
    await expectAlert("Format email tidak valid.");
  });

  it("menolak kata sandi pendek", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await fill({ name: "Ana", email: "a@b.co", password: "123", confirmation: "123" });
    submit();
    await expectAlert("Kata sandi minimal 6 karakter.");
  });

  it("menolak konfirmasi yang berbeda", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await fill({ name: "Ana", email: "a@b.co", password: "123456", confirmation: "654321" });
    submit();
    await expectAlert("Konfirmasi kata sandi tidak sama.");
    expect(register).not.toHaveBeenCalled();
  });

  it("daftar sukses lalu pindah ke login", async () => {
    register.mockResolvedValue({ ok: true, message: "Berhasil mendaftar" });
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await fill({ name: " Ana ", email: " a@b.co ", password: "123456", confirmation: "123456" });
    submit();

    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(register).toHaveBeenCalledWith({ name: "Ana", email: "a@b.co", password: "123456" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
  });

  it("menampilkan dialog error saat daftar gagal", async () => {
    register.mockResolvedValue({ ok: false, message: "Email dipakai" });
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    await fill({ name: "Ana", email: "a@b.co", password: "123456", confirmation: "123456" });
    submit();

    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai"));
    expect(showSuccessDialog).not.toHaveBeenCalled();
    expect(get(currentPath)).toBe("/auth/register");
  });

  it("menampilkan status memproses", () => {
    authLoading.set(true);
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    expect(screen.getByRole("button", { name: "Memproses..." })).toBeDisabled();
  });

  it("tautan Masuk pindah ke halaman login", async () => {
    renderWithProviders(RegisterPage, { path: "/auth/register" });
    screen.getByRole("link", { name: "Masuk" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
  });
});
