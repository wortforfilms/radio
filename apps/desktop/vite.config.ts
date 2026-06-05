import { defineConfig } from "vite";

// Vite config for the Tauri desktop frontend.
// publicDir copies public/ (incl. radio-html archive) into dist/ at build.
export default defineConfig({
  clearScreen: false,
  publicDir: "public",
  server: { port: 1420, strictPort: true },
  build: { outDir: "dist", target: "es2021", sourcemap: false },
});
