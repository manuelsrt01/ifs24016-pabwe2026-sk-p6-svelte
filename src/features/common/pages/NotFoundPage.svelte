<script>
  import { handleLinkClick } from "../../../router.js";
  import { primaryButton } from "../../../helpers/styles.js";
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
  <p class="text-7xl font-extrabold text-indigo-600">404</p>
  <h1 class="text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
  <p class="text-slate-500">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
  <a href="/" class={primaryButton} onclick={(e) => handleLinkClick(e, "/")}>Kembali ke beranda</a>
</div>
