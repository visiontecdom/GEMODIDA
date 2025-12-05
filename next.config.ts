import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep turbopack default and silence webpack/turbopack conflict.
  // We avoid custom webpack hooks here because Turbopack is the default bundler.
  turbopack: {}
};

export default nextConfig;
