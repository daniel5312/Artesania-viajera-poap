import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  productionBrowserSourceMaps: false,
  experimental: {
    parallelServerBuildTraces: false,
    serverMinification: false,
    // Eliminamos @solana/kit de aquí para evitar que el compilador lo busque
    optimizePackageImports: ['lucide-react', '@privy-io/react-auth']
  },
  // Solo transpila lo estrictamente necesario que cause errores de ESM
  transpilePackages: ['@selfxyz/core', '@selfxyz/qrcode']
};

export default nextConfig;