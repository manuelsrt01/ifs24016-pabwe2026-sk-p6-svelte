import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("lucide-svelte", async () => {
  const { default: IconStub } = await import("./test-stubs/IconStub.svelte");
  const names = [
    "Link2", "Menu", "LogOut", "LayoutGrid", "Users", "User", "Plus", "Search",
    "Trash2", "Pencil", "ImagePlus", "ExternalLink", "ArrowLeft", "X",
  ];
  return Object.fromEntries(names.map((name) => [name, IconStub]));
});
