import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";

vi.mock("../states/usersStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchUsers: vi.fn(),
}));

import UsersPage from "./UsersPage.svelte";
import { users, usersLoading, usersError, fetchUsers } from "../states/usersStore.js";

const origin = new URL(DELCOM_BASEURL).origin;
const data = [
  { id: 1, name: "Ana", email: "ana@x.id", photo: "img/a.png" },
  { id: 2, name: "Budi", email: "budi@x.id", photo: null },
];

beforeEach(() => {
  vi.resetAllMocks();
  users.set([]);
  usersLoading.set(false);
  usersError.set(null);
});

describe("UsersPage", () => {
  it("memuat pengguna saat dipasang", () => {
    renderWithProviders(UsersPage, { path: "/users" });
    expect(fetchUsers).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status loading", () => {
    usersLoading.set(true);
    renderWithProviders(UsersPage, { path: "/users" });
    expect(screen.getByText("Memuat pengguna...")).toBeInTheDocument();
  });

  it("menampilkan pesan error", () => {
    usersError.set("Gagal memuat");
    renderWithProviders(UsersPage, { path: "/users" });
    expect(screen.getByRole("alert")).toHaveTextContent("Gagal memuat");
  });

  it("menampilkan pesan kosong", () => {
    renderWithProviders(UsersPage, { path: "/users" });
    expect(screen.getByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan daftar dengan foto asli dan foto bawaan", () => {
    users.set(data);
    renderWithProviders(UsersPage, { path: "/users" });
    expect(screen.getByText("ana@x.id")).toBeInTheDocument();
    expect(screen.getByAltText("Ana")).toHaveAttribute("src", `${origin}/img/a.png`);
    expect(screen.getByAltText("Budi")).toHaveAttribute("src", `${origin}/default/img/user.png`);
  });

  it("memfilter lewat pencarian", async () => {
    users.set(data);
    renderWithProviders(UsersPage, { path: "/users" });
    const search = screen.getByLabelText("Cari pengguna");

    await fireEvent.input(search, { target: { value: "budi" } });
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();

    await fireEvent.input(search, { target: { value: "zzz" } });
    expect(screen.getByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });
});
