<script>
  import { X } from "lucide-svelte";

  let { open = false, title = "", onClose, children } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
    <button type="button" aria-label="Tutup latar" class="absolute inset-0 bg-slate-900/50" onclick={onClose}></button>
    <div class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">{title}</h2>
        <button type="button" aria-label="Tutup modal" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" onclick={onClose}>
          <X class="h-5 w-5" />
        </button>
      </div>
      {@render children()}
    </div>
  </div>
{/if}
