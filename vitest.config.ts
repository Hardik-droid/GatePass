import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@/backend": path.resolve(__dirname, "backend"),
      "@/authO": path.resolve(__dirname, "authO/src"),
      "@/database": path.resolve(__dirname, "database/src"),
      "@/utils": path.resolve(__dirname, "frontend/src/utils"),
      "@": path.resolve(__dirname, "frontend/src"),
      "server-only": path.resolve(__dirname, "test-utils/server-only.ts"),
    },
  },
});
