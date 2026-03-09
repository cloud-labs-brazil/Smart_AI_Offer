// Next.js 15 Configuration
// @see https://nextjs.org/docs/app/api-reference/config/next-config-js

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    // TODO: Remove before production (Gate G4)
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
