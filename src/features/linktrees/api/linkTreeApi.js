import { apiFetch } from "../../../helpers/apiHelper.js";

export const linkTreeApi = {
  create: (payload) => apiFetch("/link-trees", { method: "POST", body: payload }),

  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiFetch(`/link-trees/${id}/cover`, { method: "POST", formData });
  },

  update: (id, payload) => apiFetch(`/link-trees/${id}`, { method: "PUT", body: payload }),

  getAll: (isMe = false) => apiFetch("/link-trees", { query: isMe ? { is_me: 1 } : {} }),

  getById: (id) => apiFetch(`/link-trees/${id}`),

  remove: (id) => apiFetch(`/link-trees/${id}`, { method: "DELETE" }),

  removeAll: () => apiFetch("/link-trees", { method: "DELETE" }),

  addItem: (id, payload) => apiFetch(`/link-trees/${id}/items`, { method: "POST", body: payload }),

  updateItem: (id, itemId, payload) =>
    apiFetch(`/link-trees/${id}/items/${itemId}`, { method: "PUT", body: payload }),

  removeItem: (id, itemId) => apiFetch(`/link-trees/${id}/items/${itemId}`, { method: "DELETE" }),
};
