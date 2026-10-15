import { apiFetch } from "../../../helpers/apiHelper.js";

export const userApi = {
  getAll: () => apiFetch("/users"),
  getMe: () => apiFetch("/users/me"),
  updateMe: (payload) => apiFetch("/users/me", { method: "PUT", body: payload }),
  updatePhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiFetch("/users/me/photo", { method: "POST", formData });
  },
  changePassword: (payload) => apiFetch("/users/password", { method: "PUT", body: payload }),
};
