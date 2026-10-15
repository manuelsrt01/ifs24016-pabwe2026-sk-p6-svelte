import { writable } from "svelte/store";
import { userApi } from "../api/userApi.js";
import { fetchProfile } from "../../auth/states/authStore.js";
import { runAction } from "../../../helpers/storeHelper.js";

export const users = writable([]);
export const usersLoading = writable(false);
export const usersError = writable(null);
export const isUpdatingProfile = writable(false);
export const isUploadingPhoto = writable(false);
export const isChangingPassword = writable(false);

export function resetUsersState() {
  users.set([]);
  usersLoading.set(false);
  usersError.set(null);
}

export async function fetchUsers() {
  usersLoading.set(true);
  usersError.set(null);
  try {
    const response = await userApi.getAll();
    users.set(response.data?.users ?? []);
  } catch (error) {
    users.set([]);
    usersError.set(error.message);
  } finally {
    usersLoading.set(false);
  }
}

export async function updateProfile(payload) {
  const result = await runAction(isUpdatingProfile, () => userApi.updateMe(payload));
  if (result.ok) await fetchProfile();
  return result;
}

export async function uploadPhoto(file) {
  const result = await runAction(isUploadingPhoto, () => userApi.updatePhoto(file));
  if (result.ok) await fetchProfile();
  return result;
}

export function changePassword(payload) {
  return runAction(isChangingPassword, () => userApi.changePassword(payload));
}
