import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // 201 TDD suite — red until Accept/Decline lands. Keep it off `npm test`
    // so the planted suggested-credit failure stays the sole shipped red.
    exclude: ["**/node_modules/**", "tests/resolve-dispute/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
