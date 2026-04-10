import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling these CJS-only packages at build time.
  // They are loaded at runtime by Node.js directly.
  serverExternalPackages: ["pdf-parse", "@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
