import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  productionBrowserSourceMaps: false,

  experimental: {
    parallelServerBuildTraces: false,
    serverMinification: false,
    optimizePackageImports: ['lucide-react', '@privy-io/react-auth']
  },

  transpilePackages: ['@selfxyz/core', '@selfxyz/qrcode'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // 🟢 AQUÍ ESTÁ EL CAMBIO: Agregados los dominios de WalletConnect
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io; connect-src 'self' https://auth.privy.io wss://auth.privy.io https://forno.celo-sepolia.celo-testnet.org https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; frame-src 'self' https://auth.privy.io https://verify.privy.io;",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;