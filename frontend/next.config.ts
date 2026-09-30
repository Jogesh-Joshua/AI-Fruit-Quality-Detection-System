import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack is the default in Next.js 16+
  // UnoCSS works via the "uno.css" virtual import in the App Router
  // No webpack plugin needed — UnoCSS PostCSS plugin handles it at build time
  turbopack: {
    // Point to the monorepo root so Turbopack can find the root package-lock.json
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
