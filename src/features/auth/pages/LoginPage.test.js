import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";

vi.mock("../states/authStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  login: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
}));

import LoginPage from "./LoginPage.svelte";
import { login, authLoading } from "../states/authStore.js";
import { showErrorDialog } from "../../../helpers/toolsHelper.js";

const fill = async (email, password) => {
  await fireEvent.input(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  await fireEvent.input(screen.getByLabelText("Kata sandi"), {
    target: { value: password },
  });
};
const submit = () => screen.getByRole("button", { name: "Masuk" }).click();

beforeEach(() => {
  vi.resetAllMocks();
  authLoading.set(false);
});

describe("LoginPage", () => {
  it("menolak kolom kosong", async () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Email dan kata sandi wajib diisi.",
      ),
    );
    expect(login).not.toHaveBeenCalled();
  });

  it("menolak format email salah", async () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    await fill("salah", "123456");
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Format email tidak valid.",
      ),
    );
    expect(login).not.toHaveBeenCalled();
  });

  it("login sukses lalu pindah ke beranda dan menghapus pesan error", async () => {
    login.mockResolvedValue({ ok: true });
    renderWithProviders(LoginPage, { path: "/auth/login" });

    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    await fill("  a@b.co  ", "123456");
    submit();

    await waitFor(() => expect(get(currentPath)).toBe("/"));
    expect(login).toHaveBeenCalledWith({ email: "a@b.co", password: "123456" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error saat login gagal", async () => {
    login.mockResolvedValue({ ok: false, message: "Kredensial salah" });
    renderWithProviders(LoginPage, { path: "/auth/login" });
    await fill("a@b.co", "123456");
    submit();

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Kredensial salah"),
    );
    expect(get(currentPath)).toBe("/auth/login");
  });

  it("menampilkan status memproses dan menonaktifkan tombol", () => {
    authLoading.set(true);
    renderWithProviders(LoginPage, { path: "/auth/login" });
    const button = screen.getByRole("button", { name: "Memproses..." });
    expect(button).toBeDisabled();
  });

  it("tautan Daftar pindah ke halaman register", async () => {
    renderWithProviders(LoginPage, { path: "/auth/login" });
    screen.getByRole("link", { name: "Daftar" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/register"));
  });

  it("memakai id elemen yang dibutuhkan grader", () => {
    const { container } = renderWithProviders(LoginPage, {
      path: "/auth/login",
    });
    expect(container.querySelector("#login-email-input")).toBeInTheDocument();
    expect(
      container.querySelector("#login-password-input"),
    ).toBeInTheDocument();
    expect(container.querySelector("#login-submit-button")).toBeInTheDocument();
  });
});
