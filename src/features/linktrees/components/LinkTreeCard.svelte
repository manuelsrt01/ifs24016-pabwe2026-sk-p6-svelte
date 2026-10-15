<script>
  import { Link2, Trash2 } from "lucide-svelte";
  import { handleLinkClick } from "../../../router.js";
  import { hasCoverImage } from "../../../helpers/toolsHelper.js";
  import { typeLabel } from "../constants.js";

  let { linkTree, isOwner = false, onDelete } = $props();

  const href = $derived(`/link-trees/${linkTree.id}`);
</script>

<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
  <a {href} aria-label={`Buka ${linkTree.title}`} onclick={(event) => handleLinkClick(event, href)}>
    {#if hasCoverImage(linkTree.cover)}
      <img src={linkTree.cover} alt={`Cover ${linkTree.title}`} class="h-36 w-full object-cover" />
    {:else}
      <div class="flex h-36 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
        <Link2 class="h-10 w-10" />
      </div>
    {/if}
  </a>

  <div class="space-y-2 p-4">
    <div class="flex items-start justify-between gap-2">
      <a {href} class="font-bold text-slate-900 hover:text-indigo-600" onclick={(event) => handleLinkClick(event, href)}>
        {linkTree.title}
      </a>
      <span class="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
        {typeLabel(linkTree.type)}
      </span>
    </div>
    <p class="line-clamp-2 text-sm text-slate-500">{linkTree.description}</p>
    <div class="flex items-center justify-between pt-2 text-xs text-slate-500">
      <span>{`${linkTree.author.name} · ${linkTree.total_links ?? 0} tautan`}</span>
      {#if isOwner}
        <button
          type="button"
          class="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
          aria-label={`Hapus ${linkTree.title}`}
          onclick={() => onDelete(linkTree)}>
          <Trash2 class="h-4 w-4" />
        </button>
      {/if}
    </div>
  </div>
</article>