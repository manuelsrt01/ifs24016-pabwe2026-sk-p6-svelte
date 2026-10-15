import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../helpers/apiHelper.js", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../../../helpers/apiHelper.js";
import { userApi } from "./userApi.js";

beforeEach(() => apiFetch.mockReset());

describe("userApi", () => {
  it("getAll", () => {
    userApi.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/users");
  });

  it("getMe", () => {
    userApi.getMe();
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("updateMe", () => {
    userApi.updateMe({ name: "A", email: "a@b.c" });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "A", email: "a@b.c" },
    });
  });

  it("updatePhoto mengirim FormData dengan field photo", () => {
    const file = new File(["x"], "p.png", { type: "image/png" });
    userApi.updatePhoto(file);
    const [path, options] = apiFetch.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo")).toBeInstanceOf(File);
  });

  it("changePassword", () => {
    const payload = { password: "a", new_password: "b", new_password_confirmation: "b" };
    userApi.changePassword(payload);
    expect(apiFetch).toHaveBeenCalledWith("/users/password", { method: "PUT", body: payload });
  });
});
