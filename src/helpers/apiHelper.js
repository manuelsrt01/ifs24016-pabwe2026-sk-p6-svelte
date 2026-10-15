export const ACCESS_TOKEN_KEY = "access_token";
export const DEFAULT_PHOTO_PATH = "default/img/user.png";

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function toAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\/+/, "")}`;
}

function buildUrl(path, query) {
  const url = new URL(`${DELCOM_BASEURL}${path}`);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export async function apiFetch(
  path,
  { method = "GET", body, formData, query = {}, auth = true } = {}
) {
  const headers = { Accept: "application/json" };

  if (auth) {
    const token = getAccessToken();
    if (!token) {
      throw new ApiError("Token tidak tersedia. Silakan login kembali.", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (formData) {
    // Content-Type sengaja tidak diisi: browser harus membuat boundary multipart sendiri.
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body: payload });
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (auth && response.status === 401) {
    throw new ApiError("Sesi Anda telah berakhir. Silakan login kembali.", 401);
  }

  if (!json || json.status !== "success") {
    throw new ApiError(
      json?.message || `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
      json?.data ?? null
    );
  }

  return json;
}
