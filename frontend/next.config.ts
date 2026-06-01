import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Use the parent directory (workspace root) as the turbopack root to resolve node_modules, database, and authO
    root: path.resolve(__dirname, ".."),
  },
  // Use the default .next directory inside the frontend folder
};

export default nextConfig;
