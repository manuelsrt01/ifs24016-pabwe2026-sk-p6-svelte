const loadSwal = () => import("sweetalert2").then((module) => module.default);

const baseOptions = {
  confirmButtonColor: "#4f46e5",
  cancelButtonColor: "#64748b",
};

export async function showSuccessDialog(message, title = "Berhasil") {
  const Swal = await loadSwal();
  return Swal.fire({ ...baseOptions, icon: "success", title, text: message });
}

export async function showErrorDialog(message, title = "Gagal") {
  const Swal = await loadSwal();
  return Swal.fire({ ...baseOptions, icon: "error", title, text: message });
}

export async function showWarningDialog(message, title = "Perhatian") {
  const Swal = await loadSwal();
  return Swal.fire({ ...baseOptions, icon: "warning", title, text: message });
}

export async function showConfirmDialog(
  message,
  {
    title = "Apakah Anda yakin?",
    confirmText = "Ya",
    cancelText = "Batal",
  } = {},
) {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    ...baseOptions,
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function hasCoverImage(cover) {
  return Boolean(cover) && !cover.endsWith("/");
}

export function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
