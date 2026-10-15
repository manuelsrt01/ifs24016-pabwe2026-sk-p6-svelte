import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

vi.mock("../api/userApi.js", () => ({
  userApi: {
    getAll: vi.fn(),
    getMe: vi.fn(),
    updateMe: vi.fn(),
    updatePhoto: vi.fn(),
    changePassword: vi.fn(),
  },
}));
vi.mock("../../auth/api/authApi.js", () => ({ authApi: {} }));

import { userApi } from "../api/userApi.js";
import { profile } from "../../auth/states/authStore.js";
import * as store from "./usersStore.js";

const me = { id: 1, name: "Baru", email: "b@c.d" };

beforeEach(() => {
  vi.resetAllMocks();
  store.resetUsersState();
  profile.set(null);
});

describe("fetchUsers", () => {
  it("mengisi daftar pengguna", async () => {
    userApi.getAll.mockResolvedValue({ data: { users: [{ id: 1 }, { id: 2 }] } });
    await store.fetchUsers();
    expect(get(store.users)).toHaveLength(2);
    expect(get(store.usersError)).toBeNull();
    expect(get(store.usersLoading)).toBe(false);
  });

  it("memakai array kosong bila kunci users tidak ada", async () => {
    userApi.getAll.mockResolvedValue({});
    await store.fetchUsers();
    expect(get(store.users)).toEqual([]);
  });

  it("menyimpan pesan error bila gagal", async () => {
    userApi.getAll.mockRejectedValue(new Error("gagal"));
    await store.fetchUsers();
    expect(get(store.usersError)).toBe("gagal");
    expect(get(store.users)).toEqual([]);
  });
});

describe("resetUsersState", () => {
  it("mengosongkan state", () => {
    store.users.set([{ id: 1 }]);
    store.usersError.set("x");
    store.resetUsersState();
    expect(get(store.users)).toEqual([]);
    expect(get(store.usersError)).toBeNull();
  });
});

describe("updateProfile", () => {
  it("memuat ulang profil setelah sukses", async () => {
    userApi.updateMe.mockResolvedValue({ message: "Berhasil mengubah data" });
    userApi.getMe.mockResolvedValue({ data: { user: me } });
    const result = await store.updateProfile({ name: "Baru", email: "b@c.d" });
    expect(result.ok).toBe(true);
    expect(get(profile)).toEqual(me);
    expect(get(store.isUpdatingProfile)).toBe(false);
  });

  it("tidak memuat ulang profil bila gagal", async () => {
    userApi.updateMe.mockRejectedValue(new Error("gagal"));
    const result = await store.updateProfile({});
    expect(result.ok).toBe(false);
    expect(userApi.getMe).not.toHaveBeenCalled();
  });
});

describe("uploadPhoto", () => {
  it("memuat ulang profil setelah sukses", async () => {
    userApi.updatePhoto.mockResolvedValue({ message: "ok" });
    userApi.getMe.mockResolvedValue({ data: { user: me } });
    const file = new File(["x"], "p.png");
    const result = await store.uploadPhoto(file);
    expect(result.ok).toBe(true);
    expect(userApi.updatePhoto).toHaveBeenCalledWith(file);
    expect(get(profile)).toEqual(me);
  });

  it("gagal tanpa memuat ulang profil", async () => {
    userApi.updatePhoto.mockRejectedValue(new Error("gagal"));
    const result = await store.uploadPhoto(new File(["x"], "p.png"));
    expect(result.ok).toBe(false);
    expect(userApi.getMe).not.toHaveBeenCalled();
    expect(get(store.isUploadingPhoto)).toBe(false);
  });
});

describe("changePassword", () => {
  it("sukses", async () => {
    userApi.changePassword.mockResolvedValue({ message: "Berhasil mengubah kata sandi" });
    const result = await store.changePassword({ password: "a" });
    expect(result).toMatchObject({ ok: true, message: "Berhasil mengubah kata sandi" });
    expect(get(store.isChangingPassword)).toBe(false);
  });

  it("gagal", async () => {
    userApi.changePassword.mockRejectedValue(new Error("salah"));
    expect((await store.changePassword({})).ok).toBe(false);
  });
});
