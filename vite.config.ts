import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Base path for GitHub Pages. Derived from GITHUB_REPOSITORY in CI
// (set automatically by Actions) so the workflow "just works" regardless
// of repo name. Falls back to "/" for local dev and custom domains.
function resolveBasePath(): string {
  const explicit = process.env.VITE_BASE_PATH;
  if (explicit) return explicit;
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo && repo.includes("/")) {
    const name = repo.split("/")[1];
    return `/${name}/`;
  }
  return "/";
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
