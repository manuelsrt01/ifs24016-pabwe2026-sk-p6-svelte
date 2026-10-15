<script>
  import { onMount } from "svelte";
  import { Search } from "lucide-svelte";
  import { users, usersLoading, usersError, fetchUsers } from "../states/usersStore.js";
  import { toAbsoluteUrl, DEFAULT_PHOTO_PATH } from "../../../helpers/apiHelper.js";
  import { inputClass, cardClass } from "../../../helpers/styles.js";

  let search = $state("");

  onMount(() => {
    fetchUsers();
  });

  const filtered = $derived.by(() => {
    const keyword = search.trim().toLowerCase();
    return $users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(keyword));
  });
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900">Pengguna</h1>
    <p class="text-sm text-slate-500">Daftar pengguna yang terdaftar di Delcom.</p>
  </div>

  <div class="relative">
    <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input type="search" placeholder="Cari pengguna..." aria-label="Cari pengguna" class={`${inputClass} pl-10`} bind:value={search} />
  </div>

  {#if $usersLoading}
    <p class="py-10 text-center text-slate-500">Memuat pengguna...</p>
  {:else if $usersError}
    <p class="py-10 text-center text-rose-600" role="alert">{$usersError}</p>
  {:else if filtered.length === 0}
    <p class="py-10 text-center text-slate-500">Pengguna tidak ditemukan.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {#each filtered as user (user.id)}
        <li class={`${cardClass} flex items-center gap-4`}>
          <img src={toAbsoluteUrl(user.photo || DEFAULT_PHOTO_PATH)} alt={user.name} class="h-12 w-12 rounded-full object-cover" />
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-900">{user.name}</p>
            <p class="truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
