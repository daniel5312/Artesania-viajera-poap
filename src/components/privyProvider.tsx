"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { celoSepolia } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Leemos las variables de entorno o usamos tus IDs por defecto
  const privyAppId =
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmjkojeq70057l10b80nic7qk";

  return (
    <PrivyProvider
      appId="cmjkojeq70057l10b80nic7qk"
      config={{
        loginMethods: ["google", "email", "wallet"],
        supportedChains: [celoSepolia],
        defaultChain: celoSepolia,

        // Configuración de WalletConnect con variable de entorno
        externalWallets: {
          walletConnect: {
            enabled: true,
          },
        },

        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },

        appearance: {
          theme: "dark",
          accentColor: "#8162f3",
          showWalletLoginFirst: false,
          logo: "https://placehold.co/100x100/8162f3/white?text=AV",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
