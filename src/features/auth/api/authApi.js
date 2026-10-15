import { apiFetch } from "../../../helpers/apiHelper.js";

export const authApi = {
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: payload, auth: false }),
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload, auth: false }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
};
