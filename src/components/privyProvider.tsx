"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { gnosis, celo, celoSepolia } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmjkojeq70057l10b80nic7qk"
      config={{
        loginMethods: ["google", "email", "wallet", "farcaster"],
        supportedChains: [gnosis, celo, celoSepolia],
        defaultChain: gnosis, // Gnosis por defecto para tus POAPs
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        appearance: { theme: "dark", accentColor: "#8162f3" },
        //embeddedWallets: { createOnLogin: 'users-without-wallets' },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
