import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "./test-utils.js";
import { currentPath, navigate } from "./router.js";

vi.mock("./features/auth/states/authStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchProfile: vi.fn(),
}));
vi.mock("./features/linktrees/states/linkTreesStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchLinkTrees: vi.fn(),
  fetchLinkTree: vi.fn(),
  clearLinkTree: vi.fn(),
}));
vi.mock("./features/users/states/usersStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchUsers: vi.fn(),
}));

import App from "./App.svelte";
import { fetchProfile } from "./features/auth/states/authStore.js";

const user = { id: 1, name: "Ana", email: "a@x.id", photo: null };
const heading = (name) => screen.findByRole("heading", { name });

beforeEach(() => vi.resetAllMocks());

describe("App - belum login", () => {
  it("mengalihkan halaman aplikasi ke login", async () => {
    renderWithProviders(App, { path: "/" });
    expect(await heading("Masuk")).toBeInTheDocument();
    expect(get(currentPath)).toBe("/auth/login");
  });

  it("mengalihkan /users ke login", async () => {
    renderWithProviders(App, { path: "/users" });
    expect(await heading("Masuk")).toBeInTheDocument();
  });

  it("menampilkan halaman register", async () => {
    renderWithProviders(App, { path: "/auth/register" });
    expect(await heading("Daftar")).toBeInTheDocument();
    expect(get(currentPath)).toBe("/auth/register");
  });

  it("tidak memuat profil tanpa token", () => {
    renderWithProviders(App, { path: "/auth/login" });
    expect(fetchProfile).not.toHaveBeenCalled();
  });
});

describe("App - sudah login", () => {
  const render = (path, u = user) => renderWithProviders(App, { path, authToken: "t", user: u });

  it("mengalihkan halaman auth ke beranda", async () => {
    render("/auth/login");
    expect(await heading("Semua Link Tree")).toBeInTheDocument();
    expect(get(currentPath)).toBe("/");
  });

  it("menampilkan beranda dengan layout", async () => {
    render("/");
    expect(await heading("Semua Link Tree")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("menampilkan halaman pengguna", async () => {
    render("/users");
    expect(await heading("Pengguna")).toBeInTheDocument();
  });

  it("menampilkan halaman profil", async () => {
    render("/profile");
    expect(await heading("Profil")).toBeInTheDocument();
  });

  it("menampilkan halaman detail dengan parameter rute", async () => {
    render("/link-trees/5");
    expect(await screen.findByText("Memuat detail...")).toBeInTheDocument();
  });

  it("berpindah halaman saat path berubah", async () => {
    render("/");
    await heading("Semua Link Tree");
    navigate("/users");
    expect(await heading("Pengguna")).toBeInTheDocument();
  });

  it("memuat profil bila token ada tetapi profil belum ada", async () => {
    render("/", null);
    await waitFor(() => expect(fetchProfile).toHaveBeenCalledTimes(1));
  });

  it("tidak memuat profil bila sudah ada", async () => {
    render("/");
    await heading("Semua Link Tree");
    expect(fetchProfile).not.toHaveBeenCalled();
  });
});

describe("App - rute tidak dikenal", () => {
  it("menampilkan halaman 404 tanpa layout", async () => {
    renderWithProviders(App, { path: "/tidak-ada", authToken: "t", user });
    expect(await heading("Halaman tidak ditemukan")).toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });
});
