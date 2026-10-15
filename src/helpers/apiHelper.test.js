import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ApiError,
  ACCESS_TOKEN_KEY,
  apiFetch,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  toAbsoluteUrl,
} from "./apiHelper.js";

const reply = (body, status = 200) => ({ status, json: () => Promise.resolve(body) });
const brokenReply = (status) => ({ status, json: () => Promise.reject(new Error("bukan json")) });

describe("token helpers", () => {
  beforeEach(() => localStorage.clear());

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("ApiError", () => {
  it("menyimpan status dan data", () => {
    const error = new ApiError("gagal", 422, { a: ["b"] });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(422);
    expect(error.data).toEqual({ a: ["b"] });
  });

  it("memakai nilai bawaan", () => {
    const error = new ApiError("gagal");
    expect(error.status).toBe(0);
    expect(error.data).toBeNull();
  });
});

describe("toAbsoluteUrl", () => {
  const origin = new URL(DELCOM_BASEURL).origin;

  it("mengembalikan string kosong untuk nilai kosong", () => {
    expect(toAbsoluteUrl("")).toBe("");
    expect(toAbsoluteUrl(null)).toBe("");
  });

  it("mempertahankan URL absolut", () => {
    expect(toAbsoluteUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
  });

  it("menambahkan origin untuk path relatif", () => {
    expect(toAbsoluteUrl("img/profile/a.png")).toBe(`${origin}/img/profile/a.png`);
    expect(toAbsoluteUrl("/img/a.png")).toBe(`${origin}/img/a.png`);
  });
});

describe("apiFetch", () => {
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mengirim GET dengan header Authorization", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(reply({ status: "success", data: { x: 1 } }));

    const result = await apiFetch("/users");

    expect(result.data.x).toBe(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/users`);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer abc");
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body).toBeUndefined();
  });

  it("menambahkan query string", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(reply({ status: "success" }));
    await apiFetch("/link-trees", { query: { is_me: 1 } });
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/link-trees?is_me=1`);
  });

  it("mengirim body JSON", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(reply({ status: "success" }));
    await apiFetch("/link-trees", { method: "POST", body: { title: "A" } });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ title: "A" }));
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(reply({ status: "success" }));
    const formData = new FormData();
    formData.append("cover", new File(["x"], "c.png"));
    await apiFetch("/x/cover", { method: "POST", formData });
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(formData);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("tidak memakai token bila auth false", async () => {
    fetchMock.mockResolvedValue(reply({ status: "success" }));
    await apiFetch("/auth/login", { method: "POST", body: {}, auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("menolak bila token tidak tersedia", async () => {
    await expect(apiFetch("/users")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Token tidak tersedia. Silakan login kembali.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("melaporkan kegagalan jaringan", async () => {
    putAccessToken("abc");
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(apiFetch("/users")).rejects.toThrow(/Tidak dapat terhubung/);
  });

  it("melaporkan sesi berakhir pada HTTP 401 terautentikasi", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(reply({ status: "fail", message: "Unauthenticated." }, 401));
    await expect(apiFetch("/users")).rejects.toMatchObject({
      status: 401,
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
    });
  });

  it("memakai pesan server untuk 401 bila auth false (login salah)", async () => {
    fetchMock.mockResolvedValue(
      reply({ status: "fail", message: "Kredensial akun tidak ditemukan" }, 401)
    );
    await expect(apiFetch("/auth/login", { auth: false })).rejects.toMatchObject({
      status: 401,
      message: "Kredensial akun tidak ditemukan",
    });
  });

  it("meneruskan pesan dan data dari respons fail", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(
      reply({ status: "fail", message: "Data tidak valid", data: { title: ["wajib"] } }, 422)
    );
    await expect(apiFetch("/x")).rejects.toMatchObject({
      status: 422,
      message: "Data tidak valid",
      data: { title: ["wajib"] },
    });
  });

  it("memakai pesan cadangan bila respons fail tanpa pesan", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(reply({ status: "fail" }, 400));
    await expect(apiFetch("/x")).rejects.toMatchObject({
      message: "Permintaan gagal (HTTP 400).",
      data: null,
    });
  });

  it("menangani respons yang bukan JSON", async () => {
    putAccessToken("abc");
    fetchMock.mockResolvedValue(brokenReply(500));
    await expect(apiFetch("/x")).rejects.toMatchObject({
      message: "Permintaan gagal (HTTP 500).",
      status: 500,
      data: null,
    });
  });
});
