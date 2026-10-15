import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../router.js";

vi.mock("../../auth/states/authStore.js", async (importOriginal) => ({
  ...(await importOriginal()),
  logout: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper.js", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
}));

import LinkTreeNavbar from "./LinkTreeNavbar.svelte";
import { logout } from "../../auth/states/authStore.js";
import { showConfirmDialog } from "../../../helpers/toolsHelper.js";

const origin = new URL(DELCOM_BASEURL).origin;
const user = { id: 1, name: "Ana", email: "a@x.id", photo: null };
const render = (u = user, onMenuClick = vi.fn()) =>
  renderWithProviders(LinkTreeNavbar, { path: "/", authToken: "t", user: u, props: { onMenuClick } });

beforeEach(() => vi.resetAllMocks());

describe("LinkTreeNavbar", () => {
  it("menampilkan logo, nama, dan foto bawaan", () => {
    render();
    expect(screen.getByText("Delcom Link Tree")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByAltText("Ana")).toHaveAttribute("src", `${origin}/default/img/user.png`);
  });

  it("memakai foto profil bila ada", () => {
    render({ ...user, photo: "img/p.png" });
    expect(screen.getByAltText("Ana")).toHaveAttribute("src", `${origin}/img/p.png`);
  });

  it("tidak menampilkan profil bila belum dimuat", () => {
    render(null);
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("memanggil onMenuClick", () => {
    const onMenuClick = vi.fn();
    render(user, onMenuClick);
    screen.getByRole("button", { name: "Buka menu" }).click();
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("tidak logout bila konfirmasi dibatalkan", async () => {
    showConfirmDialog.mockResolvedValue(false);
    render();
    screen.getByRole("button", { name: "Keluar" }).click();
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(logout).not.toHaveBeenCalled();
  });

  it("logout lalu pindah ke halaman login bila dikonfirmasi", async () => {
    showConfirmDialog.mockResolvedValue(true);
    logout.mockResolvedValue();
    render();
    screen.getByRole("button", { name: "Keluar" }).click();
    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
