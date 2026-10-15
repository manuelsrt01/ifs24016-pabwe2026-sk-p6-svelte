<script>
  import { Link2 } from "lucide-svelte";

  let { children } = $props();
</script>

<div class="grid min-h-screen lg:grid-cols-2">
  <aside class="hidden flex-col justify-center gap-6 bg-indigo-600 p-12 text-white lg:flex">
    <div class="flex items-center gap-3">
      <Link2 class="h-10 w-10" />
      <span class="text-3xl font-extrabold">Delcom Link Tree</span>
    </div>
    <p class="max-w-md text-lg text-indigo-100">
      Kumpulkan semua tautan penting Anda dalam satu halaman. Bagikan kumpulan tautan secara
      publik, tidak terdaftar, atau privat dengan mudah.
    </p>
  </aside>

  <main class="flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <div class="mb-8 flex items-center gap-2 text-indigo-600 lg:hidden">
        <Link2 class="h-7 w-7" />
        <span class="text-xl font-extrabold">Delcom Link Tree</span>
      </div>
      {@render children()}
    </div>
  </main>
</div>
