<script>
  import { onMount } from "svelte";
  import { Plus, Search, Trash2 } from "lucide-svelte";
  import { profile } from "../../auth/states/authStore.js";
  import {
    linkTrees,
    linkTreesLoading,
    linkTreesError,
    isDeletingAll,
    fetchLinkTrees,
    removeLinkTree,
    removeAllLinkTrees,
  } from "../states/linkTreesStore.js";
  import LinkTreeCard from "../components/LinkTreeCard.svelte";
  import AddModal from "../modals/AddModal.svelte";
  import { showConfirmDialog, showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { inputClass, primaryButton, dangerButton, secondaryButton, cardClass } from "../../../helpers/styles.js";

  let search = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  onMount(() => {
    fetchLinkTrees(false);
  });

  const filtered = $derived.by(() => {
    const keyword = search.trim().toLowerCase();
    return $linkTrees.filter((item) =>
      `${item.title} ${item.description} ${item.author.name}`.toLowerCase().includes(keyword)
    );
  });

  const stats = $derived({
    total: $linkTrees.length,
    links: $linkTrees.reduce((sum, item) => sum + (item.total_links ?? 0), 0),
    publicCount: $linkTrees.filter((item) => item.type === "public").length,
    mine: $linkTrees.filter((item) => item.user_id === $profile?.id).length,
  });

  const statCards = $derived([
    { label: "Total Link Tree", value: stats.total },
    { label: "Total Tautan", value: stats.links },
    { label: "Publik", value: stats.publicCount },
    { label: "Milik Saya", value: stats.mine },
  ]);

  async function toggleMine() {
    onlyMine = !onlyMine;
    await fetchLinkTrees(onlyMine);
  }

  async function handleDelete(item) {
    const confirmed = await showConfirmDialog(
      `Link Tree "${item.title}" beserta seluruh tautannya akan dihapus.`
    );
    if (!confirmed) return;

    const result = await removeLinkTree(item.id);
    if (result.ok) {
      await showSuccessDialog(result.message);
    } else {
      await showErrorDialog(result.message);
    }
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog(
      "Semua Link Tree milik Anda beserta cover dan tautannya akan dihapus permanen.",
      { title: "Hapus semua Link Tree?", confirmText: "Hapus semua" }
    );
    if (!confirmed) return;

    const result = await removeAllLinkTrees();
    if (result.ok) {
      await showSuccessDialog(result.message);
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Semua Link Tree</h1>
      <p class="text-sm text-slate-500">Kumpulan tautan yang tersedia untuk Anda.</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button type="button" class={primaryButton} onclick={() => (showAdd = true)}>
        <Plus class="h-4 w-4" /> Tambah Link Tree
      </button>
      <button type="button" class={dangerButton} disabled={$isDeletingAll} onclick={handleDeleteAll}>
        <Trash2 class="h-4 w-4" /> Hapus Semua
      </button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {#each statCards as card (card.label)}
      <div class={cardClass}>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
        <p class="mt-1 text-3xl font-extrabold text-indigo-600">{card.value}</p>
      </div>
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-3">
    <div class="relative min-w-[220px] flex-1">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        placeholder="Cari Link Tree..."
        aria-label="Cari Link Tree"
        class={`${inputClass} pl-10`}
        bind:value={search} />
    </div>
    <button type="button" class={secondaryButton} aria-pressed={onlyMine} onclick={toggleMine}>
      {onlyMine ? "Tampilkan semua" : "Hanya milik saya"}
    </button>
  </div>

  {#if $linkTreesLoading}
    <p class="py-10 text-center text-slate-500">Memuat data...</p>
  {:else if $linkTreesError}
    <p class="py-10 text-center text-rose-600" role="alert">{$linkTreesError}</p>
  {:else if filtered.length === 0}
    <p class="py-10 text-center text-slate-500">Tidak ada Link Tree yang ditemukan.</p>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as item (item.id)}
        <LinkTreeCard linkTree={item} isOwner={item.user_id === $profile?.id} onDelete={handleDelete} />
      {/each}
    </div>
  {/if}
</div>

<AddModal open={showAdd} onClose={() => (showAdd = false)} />
