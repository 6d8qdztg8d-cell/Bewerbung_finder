import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
