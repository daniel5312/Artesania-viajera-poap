"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { gnosis, celo, celoSepolia } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmjkojeq70057l10b80nic7qk"
      config={{
        loginMethods: ["google", "email", "wallet", "farcaster"],
        supportedChains: [celo, gnosis, celoSepolia],
        defaultChain: celo,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          // @ts-expect-error - Privy's type definitions may not match the runtime property
          noPromptOnSignature: true,
        },
        appearance: { theme: "dark", accentColor: "#8162f3" },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
