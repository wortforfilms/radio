import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the Tauri desktop frontend.
// publicDir copies public/ (incl. radio-html archive) into dist/ at build.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  publicDir: "public",
  server: { port: 1420, strictPort: true },
  build: { outDir: "dist", target: "es2021", sourcemap: false },
});
