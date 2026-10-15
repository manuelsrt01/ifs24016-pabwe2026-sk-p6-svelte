<script>
  import { ArrowLeft, ExternalLink, ImagePlus, Pencil, Plus, Trash2 } from "lucide-svelte";
  import { profile } from "../../auth/states/authStore.js";
  import {
    linkTree,
    linkTreeError,
    fetchLinkTree,
    clearLinkTree,
    removeLinkTree,
    removeItem,
  } from "../states/linkTreesStore.js";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import { navigate, handleLinkClick } from "../../../router.js";
  import {
    formatDate,
    hasCoverImage,
    showConfirmDialog,
    showSuccessDialog,
    showErrorDialog,
  } from "../../../helpers/toolsHelper.js";
  import { typeLabel } from "../constants.js";
  import { cardClass, dangerButton, primaryButton, secondaryButton } from "../../../helpers/styles.js";

  let { params } = $props();

  let showChange = $state(false);
  let showCover = $state(false);
  let showItem = $state(false);
  let editingItem = $state(null);

  const isOwner = $derived($linkTree !== null && $linkTree.user_id === $profile?.id);

  $effect(() => {
    fetchLinkTree(params.linkTreeId);
    return () => clearLinkTree();
  });

  function openAddItem() {
    editingItem = null;
    showItem = true;
  }

  function openEditItem(item) {
    editingItem = item;
    showItem = true;
  }

  async function handleDeleteItem(item) {
    const confirmed = await showConfirmDialog(`Tautan "${item.title}" akan dihapus.`);
    if (!confirmed) return;

    const result = await removeItem($linkTree.id, item.id);
    if (result.ok) {
      await showSuccessDialog(result.message);
    } else {
      await showErrorDialog(result.message);
    }
  }

  async function handleDeleteTree() {
    const confirmed = await showConfirmDialog(
      `Link Tree "${$linkTree.title}" beserta seluruh tautannya akan dihapus.`
    );
    if (!confirmed) return;

    const result = await removeLinkTree($linkTree.id);
    if (result.ok) {
      await showSuccessDialog(result.message);
      navigate("/");
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<div class="space-y-6">
  <a href="/" class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600" onclick={(e) => handleLinkClick(e, "/")}>
    <ArrowLeft class="h-4 w-4" /> Kembali
  </a>

  {#if $linkTreeError && !$linkTree}
    <p class="py-10 text-center text-rose-600" role="alert">{$linkTreeError}</p>
  {:else if !$linkTree}
    <p class="py-10 text-center text-slate-500">Memuat detail...</p>
  {:else}
    {@const items = $linkTree.items ?? []}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {#if hasCoverImage($linkTree.cover)}
        <img src={$linkTree.cover} alt={`Cover ${$linkTree.title}`} class="h-56 w-full object-cover" />
      {:else}
        <div class="h-56 w-full bg-gradient-to-br from-indigo-500 to-violet-500"></div>
      {/if}

      <div class="space-y-3 p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">{$linkTree.title}</h1>
            <p class="text-sm text-slate-500">
              {`Oleh ${$linkTree.author.name} · ${formatDate($linkTree.created_at)}`}
            </p>
          </div>
          <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {typeLabel($linkTree.type)}
          </span>
        </div>
        <p class="text-slate-600">{$linkTree.description}</p>

        {#if isOwner}
          <div class="flex flex-wrap gap-2 pt-2">
            <button type="button" class={secondaryButton} onclick={() => (showChange = true)}>
              <Pencil class="h-4 w-4" /> Ubah Data
            </button>
            <button type="button" class={secondaryButton} onclick={() => (showCover = true)}>
              <ImagePlus class="h-4 w-4" /> Ubah Cover
            </button>
            <button type="button" class={dangerButton} onclick={handleDeleteTree}>
              <Trash2 class="h-4 w-4" /> Hapus
            </button>
          </div>
        {/if}
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">{`Tautan (${items.length})`}</h2>
        {#if isOwner}
          <button type="button" class={primaryButton} onclick={openAddItem}>
            <Plus class="h-4 w-4" /> Tambah Tautan
          </button>
        {/if}
      </div>

      {#if items.length === 0}
        <p class="py-6 text-center text-slate-500">Belum ada tautan.</p>
      {:else}
        <ul class="space-y-3">
          {#each items as item (item.id)}
            <li class={`${cardClass} flex items-center justify-between gap-3`}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" class="flex min-w-0 flex-1 items-center gap-3">
                <ExternalLink class="h-5 w-5 shrink-0 text-indigo-600" />
                <span class="min-w-0">
                  <span class="block truncate font-semibold text-slate-900">{item.title}</span>
                  <span class="block truncate text-xs text-slate-500">{item.url}</span>
                </span>
              </a>
              {#if isOwner}
                <div class="flex gap-1">
                  <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label={`Ubah ${item.title}`} onclick={() => openEditItem(item)}>
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button type="button" class="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label={`Hapus ${item.title}`} onclick={() => handleDeleteItem(item)}>
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <ChangeModal open={showChange} linkTree={$linkTree} onClose={() => (showChange = false)} />
    <ChangeCoverModal open={showCover} linkTreeId={$linkTree.id} onClose={() => (showCover = false)} />
    <ItemModal open={showItem} linkTreeId={$linkTree.id} item={editingItem} onClose={() => (showItem = false)} />
  {/if}
</div>