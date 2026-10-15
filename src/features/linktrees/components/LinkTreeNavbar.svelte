<script>
  import { Link2, LogOut, Menu } from "lucide-svelte";
  import { profile, logout } from "../../auth/states/authStore.js";
  import { navigate } from "../../../router.js";
  import { showConfirmDialog } from "../../../helpers/toolsHelper.js";
  import { toAbsoluteUrl, DEFAULT_PHOTO_PATH } from "../../../helpers/apiHelper.js";

  let { onMenuClick } = $props();

  async function handleLogout() {
    const confirmed = await showConfirmDialog("Anda akan keluar dari akun ini.", {
      title: "Keluar?",
      confirmText: "Keluar",
    });
    if (!confirmed) return;
    await logout();
    navigate("/auth/login", { replace: true });
  }
</script>

<header class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
  <div class="flex items-center gap-3">
    <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Buka menu" onclick={onMenuClick}>
      <Menu class="h-5 w-5" />
    </button>
    <div class="flex items-center gap-2 text-indigo-600">
      <Link2 class="h-6 w-6" />
      <span class="text-lg font-extrabold">Delcom Link Tree</span>
    </div>
  </div>

  <div class="flex items-center gap-3">
    {#if $profile}
      <img
        src={toAbsoluteUrl($profile.photo || DEFAULT_PHOTO_PATH)}
        alt={$profile.name}
        class="h-9 w-9 rounded-full object-cover" />
      <span class="hidden text-sm font-semibold text-slate-700 sm:inline">{$profile.name}</span>
    {/if}
    <button type="button" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Keluar" onclick={handleLogout}>
      <LogOut class="h-5 w-5" />
    </button>
  </div>
</header>
