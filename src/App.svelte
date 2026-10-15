<script>
  import { currentPath, navigate, resolveRoute } from "./router.js";
  import { token, profile, fetchProfile } from "./features/auth/states/authStore.js";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LoginPage from "./features/auth/pages/LoginPage.svelte";
  import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
  import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
  import HomePage from "./features/linktrees/pages/HomePage.svelte";
  import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
  import UsersPage from "./features/users/pages/UsersPage.svelte";
  import ProfilePage from "./features/users/pages/ProfilePage.svelte";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

  const pages = {
    login: LoginPage,
    register: RegisterPage,
    home: HomePage,
    detail: DetailPage,
    users: UsersPage,
    profile: ProfilePage,
    "not-found": NotFoundPage,
  };

  const route = $derived(resolveRoute($currentPath));
  const Page = $derived(pages[route.name]);

  $effect(() => {
    if (route.layout === "app" && !$token) {
      navigate("/auth/login", { replace: true });
    } else if (route.layout === "auth" && $token) {
      navigate("/", { replace: true });
    }
  });

  $effect(() => {
    if ($token && !$profile) {
      fetchProfile();
    }
  });
</script>

{#if route.layout === "auth"}
  {#if !$token}
    <AuthLayout><Page /></AuthLayout>
  {/if}
{:else if route.layout === "app"}
  {#if $token}
    <LinkTreeLayout><Page params={route.params} /></LinkTreeLayout>
  {/if}
{:else}
  <Page />
{/if}
