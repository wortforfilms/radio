import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/._*"]
  },
  resolve: {
    alias: {
      "@runtime": path.join(root, "packages/runtime/src"),
      "@graph": path.join(root, "packages/graph/src"),
      "@search": path.join(root, "packages/search/src"),
      "@shared": path.join(root, "packages/shared/src")
    }
  }
});
