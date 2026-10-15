import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
  formatDate,
  hasCoverImage,
  isValidEmail,
  isValidHttpUrl,
} from "./toolsHelper.js";

beforeEach(() => {
  Swal.fire.mockReset();
  Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe("dialog", () => {
  it("showSuccessDialog memakai judul bawaan dan judul kustom", async () => {
    await showSuccessDialog("ok");
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: "success", title: "Berhasil", text: "ok" })
    );
    await showSuccessDialog("ok", "Judul");
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Judul" }));
  });

  it("showErrorDialog memakai judul bawaan dan judul kustom", async () => {
    await showErrorDialog("gagal");
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: "error", title: "Gagal", text: "gagal" })
    );
    await showErrorDialog("gagal", "Oops");
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Oops" }));
  });

  it("showWarningDialog memakai judul bawaan dan judul kustom", async () => {
    await showWarningDialog("hati-hati");
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ icon: "warning", title: "Perhatian" })
    );
    await showWarningDialog("hati-hati", "Awas");
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Awas" }));
  });

  it("showConfirmDialog mengembalikan true saat dikonfirmasi", async () => {
    expect(await showConfirmDialog("hapus?")).toBe(true);
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({
        showCancelButton: true,
        title: "Apakah Anda yakin?",
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      })
    );
  });

  it("showConfirmDialog mengembalikan false saat dibatalkan dan menerima opsi", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    const result = await showConfirmDialog("keluar?", {
      title: "Keluar?",
      confirmText: "Keluar",
      cancelText: "Tidak",
    });
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Keluar?", confirmButtonText: "Keluar", cancelButtonText: "Tidak" })
    );
  });
});

describe("formatDate", () => {
  it("mengembalikan strip untuk nilai kosong atau tidak valid", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
  });

  it("memformat tanggal ISO", () => {
    expect(formatDate("2025-03-09T01:32:33.000000Z")).toMatch(/2025/);
  });
});

describe("hasCoverImage", () => {
  it("false untuk kosong dan URL yang hanya origin", () => {
    expect(hasCoverImage("")).toBe(false);
    expect(hasCoverImage(null)).toBe(false);
    expect(hasCoverImage("http://localhost:8000/")).toBe(false);
  });

  it("true untuk URL gambar", () => {
    expect(hasCoverImage("http://x.test/img/c.jpg")).toBe(true);
  });
});

describe("validator", () => {
  it("isValidEmail", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("salah")).toBe(false);
  });

  it("isValidHttpUrl", () => {
    expect(isValidHttpUrl("https://delcom.org")).toBe(true);
    expect(isValidHttpUrl("http://delcom.org")).toBe(true);
    expect(isValidHttpUrl("ftp://delcom.org")).toBe(false);
    expect(isValidHttpUrl("bukan url")).toBe(false);
  });
});
