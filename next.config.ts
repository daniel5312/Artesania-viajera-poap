import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true }, // Ahorra RAM al no validar tipos en el build
  eslint: { ignoreDuringBuilds: true },    // Evita procesos pesados de linting
  experimental: {
    parallelServerBuildTraces: false,      // Clave para evitar el error SIGKILL (OOM)
    serverMinification: false              // Reduce la carga del CPU durante la compilación
  },
  // Necesario para compatibilidad de librerías Web3 con Next 15+
  transpilePackages: ['@solana/kit', '@selfxyz/core', '@selfxyz/qrcode']
};

export default nextConfig;