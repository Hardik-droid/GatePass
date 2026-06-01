import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "frontend/.next",
  turbopack: {
    root: path.resolve(__dirname, "frontend"),
  },
};

export default nextConfig;
