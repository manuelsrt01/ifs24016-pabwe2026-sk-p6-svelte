<script>
  import LinkTreeNavbar from "../components/LinkTreeNavbar.svelte";
  import LinkTreeSidebar from "../components/LinkTreeSidebar.svelte";

  let { children } = $props();
  let sidebarOpen = $state(false);
</script>

<div class="min-h-screen bg-slate-50">
  <LinkTreeNavbar onMenuClick={() => (sidebarOpen = !sidebarOpen)} />
  <div class="flex">
    <LinkTreeSidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />
    <main class="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
      {@render children()}
    </main>
  </div>
</div>
