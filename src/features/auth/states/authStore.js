import { writable, derived } from "svelte/store";
import { authApi } from "../api/authApi.js";
import { userApi } from "../../users/api/userApi.js";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper.js";
import { runAction } from "../../../helpers/storeHelper.js";

export const token = writable(getAccessToken());
export const profile = writable(null);
export const authLoading = writable(false);
export const isAuthenticated = derived(token, ($token) => Boolean($token));

export function clearSession() {
  removeAccessToken();
  token.set(null);
  profile.set(null);
}

async function loadProfile() {
  const response = await userApi.getMe();
  profile.set(response.data.user);
}

export async function fetchProfile() {
  try {
    await loadProfile();
    return true;
  } catch (error) {
    if (error.status === 401) {
      clearSession();
    }
    return false;
  }
}

export function login(credentials) {
  return runAction(authLoading, async () => {
    const response = await authApi.login(credentials);
    putAccessToken(response.data.token);
    try {
      await loadProfile();
    } catch (error) {
      removeAccessToken();
      throw error;
    }
    // Token baru dipublikasikan setelah profil siap supaya pengalihan tidak lebih cepat dari data.
    token.set(response.data.token);
    return response;
  });
}

export function register(payload) {
  return runAction(authLoading, () => authApi.register(payload));
}

export async function logout() {
  try {
    await authApi.logout();
  } catch {
    // Gagal di server tidak boleh menahan pengguna; sesi lokal tetap dibersihkan.
  }
  clearSession();
}
