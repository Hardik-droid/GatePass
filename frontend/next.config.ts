import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "../.next",
  turbopack: {
    // Use the parent directory (workspace root) as the turbopack root to resolve node_modules, database, and authO
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
