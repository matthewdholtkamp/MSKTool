import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: []
  },
  resolve: {
    alias: {
      "@msk/msk-content": path.resolve(
        __dirname,
        "packages/msk-content/src/index.ts"
      ),
      "@msk/msk-content/": path.resolve(__dirname, "packages/msk-content/src/")
    }
  }
});
