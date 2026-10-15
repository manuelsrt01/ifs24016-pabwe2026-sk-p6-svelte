import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

vi.mock("../api/authApi.js", () => ({
  authApi: { login: vi.fn(), register: vi.fn(), logout: vi.fn() },
}));
vi.mock("../../users/api/userApi.js", () => ({ userApi: { getMe: vi.fn() } }));

import { authApi } from "../api/authApi.js";
import { userApi } from "../../users/api/userApi.js";
import { ApiError } from "../../../helpers/apiHelper.js";
import * as auth from "./authStore.js";

const user = { id: 1, name: "Delcom", email: "d@delcom.org" };

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  auth.token.set(null);
  auth.profile.set(null);
});

describe("token awal", () => {
  it("membaca token dari localStorage saat modul dimuat", async () => {
    localStorage.setItem("access_token", "tersimpan");
    vi.resetModules();
    const fresh = await import("./authStore.js");
    expect(get(fresh.token)).toBe("tersimpan");
    expect(get(fresh.isAuthenticated)).toBe(true);
  });
});

describe("isAuthenticated", () => {
  it("mengikuti token", () => {
    expect(get(auth.isAuthenticated)).toBe(false);
    auth.token.set("t");
    expect(get(auth.isAuthenticated)).toBe(true);
  });
});

describe("login", () => {
  it("menyimpan token dan profil bila sukses", async () => {
    authApi.login.mockResolvedValue({ message: "Berhasil login", data: { token: "t1", user } });
    userApi.getMe.mockResolvedValue({ data: { user } });

    const result = await auth.login({ email: "d@delcom.org", password: "123456" });

    expect(result.ok).toBe(true);
    expect(get(auth.token)).toBe("t1");
    expect(get(auth.profile)).toEqual(user);
    expect(localStorage.getItem("access_token")).toBe("t1");
    expect(get(auth.authLoading)).toBe(false);
  });

  it("mengembalikan pesan bila kredensial salah", async () => {
    authApi.login.mockRejectedValue(new ApiError("Kredensial akun tidak ditemukan", 401));
    const result = await auth.login({ email: "x", password: "y" });
    expect(result).toMatchObject({ ok: false, message: "Kredensial akun tidak ditemukan" });
    expect(get(auth.token)).toBeNull();
  });

  it("membatalkan login bila profil gagal dimuat", async () => {
    authApi.login.mockResolvedValue({ data: { token: "t1", user } });
    userApi.getMe.mockRejectedValue(new ApiError("Server error", 500));

    const result = await auth.login({ email: "a", password: "b" });

    expect(result.ok).toBe(false);
    expect(get(auth.token)).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});

describe("register", () => {
  it("sukses", async () => {
    authApi.register.mockResolvedValue({ message: "Berhasil melakukan pendaftaran" });
    const result = await auth.register({ name: "A", email: "a@b.c", password: "123456" });
    expect(result).toMatchObject({ ok: true, message: "Berhasil melakukan pendaftaran" });
  });

  it("gagal", async () => {
    authApi.register.mockRejectedValue(new ApiError("Data tidak valid", 422, { email: ["sudah dipakai"] }));
    const result = await auth.register({});
    expect(result).toMatchObject({ ok: false, message: "Data tidak valid: sudah dipakai" });
  });
});

describe("fetchProfile", () => {
  it("mengisi profil dan mengembalikan true", async () => {
    userApi.getMe.mockResolvedValue({ data: { user } });
    expect(await auth.fetchProfile()).toBe(true);
    expect(get(auth.profile)).toEqual(user);
  });

  it("mempertahankan sesi bila gagal bukan karena 401", async () => {
    auth.token.set("t");
    localStorage.setItem("access_token", "t");
    userApi.getMe.mockRejectedValue(new ApiError("Server error", 500));
    expect(await auth.fetchProfile()).toBe(false);
    expect(get(auth.token)).toBe("t");
  });

  it("membersihkan sesi bila 401", async () => {
    auth.token.set("t");
    localStorage.setItem("access_token", "t");
    userApi.getMe.mockRejectedValue(new ApiError("Sesi berakhir", 401));
    expect(await auth.fetchProfile()).toBe(false);
    expect(get(auth.token)).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});

describe("logout", () => {
  it("membersihkan sesi setelah logout server sukses", async () => {
    auth.token.set("t");
    auth.profile.set(user);
    localStorage.setItem("access_token", "t");
    authApi.logout.mockResolvedValue({ message: "Berhasil logout" });
    await auth.logout();
    expect(get(auth.token)).toBeNull();
    expect(get(auth.profile)).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("tetap membersihkan sesi walau server gagal", async () => {
    auth.token.set("t");
    authApi.logout.mockRejectedValue(new ApiError("Jaringan", 0));
    await auth.logout();
    expect(get(auth.token)).toBeNull();
  });
});
