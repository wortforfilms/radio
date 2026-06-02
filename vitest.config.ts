import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/._*"]
  },
  resolve: {
    alias: {
      "@runtime": "/Volumes/LaCie/pprm/for_radio/packages/runtime/src",
      "@graph": "/Volumes/LaCie/pprm/for_radio/packages/graph/src",
      "@search": "/Volumes/LaCie/pprm/for_radio/packages/search/src",
      "@shared": "/Volumes/LaCie/pprm/for_radio/packages/shared/src"
    }
  }
});
