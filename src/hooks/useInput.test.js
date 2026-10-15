import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { useInput } from "./useInput.js";

describe("useInput", () => {
  it("memakai nilai awal kosong secara bawaan", () => {
    const { value } = useInput();
    expect(get(value)).toBe("");
  });

  it("menyimpan, mengubah, dan mereset nilai", () => {
    const { value, set, reset } = useInput("awal");
    expect(get(value)).toBe("awal");
    set("baru");
    expect(get(value)).toBe("baru");
    reset();
    expect(get(value)).toBe("awal");
  });
});
