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

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mypinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
    ],
  },
  transpilePackages: ['@selfxyz/core', '@selfxyz/qrcode'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // 🟢 CSP ACTUALIZADO: Se agregó WalletConnect al frame-src
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io; connect-src 'self' https://auth.privy.io wss://auth.privy.io https://forno.celo.org https: https://forno.celo-sepolia.celo-testnet.org https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://gateway.pinata.cloud https://*.mypinata.cloud; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https: https://gateway.pinata.cloud https://*.mypinata.cloud; font-src 'self' data:; frame-src 'self' https://auth.privy.io https://verify.privy.io https://verify.walletconnect.org https://verify.walletconnect.com;",
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