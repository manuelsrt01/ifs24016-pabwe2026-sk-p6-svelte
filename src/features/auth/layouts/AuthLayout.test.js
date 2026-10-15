import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import AuthLayout from "./AuthLayout.svelte";

describe("AuthLayout", () => {
  it("merender branding, teks kumpulan tautan, dan konten anak", () => {
    const children = createRawSnippet(() => ({ render: () => "<p>Konten anak</p>" }));
    render(AuthLayout, { props: { children } });

    expect(screen.getByText("Konten anak")).toBeInTheDocument();
    expect(screen.getAllByText("Delcom Link Tree")).toHaveLength(2);
    expect(screen.getByText(/Kumpulkan semua tautan penting/)).toBeInTheDocument();
  });
});
