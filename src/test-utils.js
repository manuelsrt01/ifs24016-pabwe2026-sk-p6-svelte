import { render } from "@testing-library/svelte";
import { token, profile } from "./features/auth/states/authStore.js";
import { currentPath } from "./router.js";

export function renderWithProviders(
  Component,
  { props = {}, path = "/", authToken = null, user = null } = {}
) {
  window.history.pushState({}, "", path);
  currentPath.set(path);
  token.set(authToken);
  profile.set(user);
  return render(Component, { props });
}
