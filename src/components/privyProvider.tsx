"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { celoSepolia, celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/Wagmi"; // Importación limpia

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmjkojeq70057l10b80nic7qk"
      config={{
        loginMethods: ["google", "email", "wallet"],
        supportedChains: [celo],
        defaultChain: celo,
        externalWallets: {
          walletConnect: { enabled: true },
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        appearance: {
          theme: "dark",
          accentColor: "#8162f3",
          logo: "https://placehold.co/100x100/8162f3/white?text=AV",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
