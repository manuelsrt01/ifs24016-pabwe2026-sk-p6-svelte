import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../helpers/apiHelper.js", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../../../helpers/apiHelper.js";
import { authApi } from "./authApi.js";

beforeEach(() => apiFetch.mockReset());

describe("authApi", () => {
  it("login memanggil POST /auth/login tanpa token", () => {
    authApi.login({ email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
      auth: false,
    });
  });

  it("register memanggil POST /auth/register tanpa token", () => {
    authApi.register({ name: "A", email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "A", email: "a@b.c", password: "123456" },
      auth: false,
    });
  });

  it("logout memanggil POST /auth/logout dengan token", () => {
    authApi.logout();
    expect(apiFetch).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
