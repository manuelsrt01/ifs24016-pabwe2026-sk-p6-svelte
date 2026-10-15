import { describe, it, expect } from "vitest";
import { writable, get } from "svelte/store";
import { runAction } from "./storeHelper.js";
import { ApiError } from "./apiHelper.js";

describe("runAction", () => {
  it("mengembalikan ok true dan menyalakan lalu mematikan flag", async () => {
    const flag = writable(false);
    let during = null;
    const result = await runAction(flag, async () => {
      during = get(flag);
      return { message: "Berhasil", data: { id: 1 } };
    });
    expect(during).toBe(true);
    expect(get(flag)).toBe(false);
    expect(result).toEqual({ ok: true, message: "Berhasil", data: { id: 1 } });
  });

  it("menggabungkan detail validasi ke pesan", async () => {
    const flag = writable(false);
    const result = await runAction(flag, async () => {
      throw new ApiError("Data tidak valid", 422, { email: ["a", "b"], name: ["c"] });
    });
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Data tidak valid: a, b, c");
    expect(result.errors).toEqual({ email: ["a", "b"], name: ["c"] });
    expect(get(flag)).toBe(false);
  });

  it("memakai pesan error biasa bila tidak ada detail", async () => {
    const flag = writable(false);
    const result = await runAction(flag, async () => {
      throw new Error("boom");
    });
    expect(result).toEqual({ ok: false, message: "boom", errors: undefined });
  });

  it("menangani data null pada ApiError", async () => {
    const flag = writable(false);
    const result = await runAction(flag, async () => {
      throw new ApiError("gagal", 500, null);
    });
    expect(result.message).toBe("gagal");
  });
});
