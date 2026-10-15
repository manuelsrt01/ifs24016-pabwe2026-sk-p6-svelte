import { writable } from "svelte/store";

export const currentPath = writable(window.location.pathname);

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  currentPath.set(path);
}

window.addEventListener("popstate", () => {
  currentPath.set(window.location.pathname);
});

export function handleLinkClick(event, path) {
  event.preventDefault();
  navigate(path);
}

const STATIC_ROUTES = {
  "/auth/login": { name: "login", layout: "auth" },
  "/auth/register": { name: "register", layout: "auth" },
  "/": { name: "home", layout: "app" },
  "/users": { name: "users", layout: "app" },
  "/profile": { name: "profile", layout: "app" },
};

export function resolveRoute(path) {
  const clean = path.replace(/\/+$/, "") || "/";
  const staticRoute = STATIC_ROUTES[clean];
  if (staticRoute) {
    return { ...staticRoute, params: {} };
  }

  const detail = clean.match(/^\/link-trees\/([^/]+)$/);
  if (detail) {
    return { name: "detail", layout: "app", params: { linkTreeId: detail[1] } };
  }

  return { name: "not-found", layout: "none", params: {} };
}
