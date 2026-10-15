<script>
  import { LayoutGrid, Users, User } from "lucide-svelte";
  import { currentPath, handleLinkClick } from "../../../router.js";

  let { open = false, onClose } = $props();

  const menus = [
    { label: "Semua Link Tree", path: "/", icon: LayoutGrid },
    { label: "Pengguna", path: "/users", icon: Users },
    { label: "Profil", path: "/profile", icon: User },
  ];

  function isActive(path, current) {
    if (path === "/") {
      return current === "/" || current.startsWith("/link-trees/");
    }
    return current.startsWith(path);
  }

  function go(event, path) {
    handleLinkClick(event, path);
    onClose();
  }
</script>

<aside
  class={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white pt-20 transition-transform md:static md:translate-x-0 md:pt-4 ${open ? "translate-x-0" : "-translate-x-full"}`}>
  <nav class="space-y-1 px-3">
    {#each menus as menu (menu.path)}
      {@const Icon = menu.icon}
      <a
        href={menu.path}
        aria-current={isActive(menu.path, $currentPath) ? "page" : undefined}
        class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive(menu.path, $currentPath) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
        onclick={(event) => go(event, menu.path)}>
        <Icon class="h-5 w-5" />
        <span>{menu.label}</span>
      </a>
    {/each}
  </nav>
</aside>