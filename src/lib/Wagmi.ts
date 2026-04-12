import { createConfig } from "@privy-io/wagmi";
import { celoSepolia } from "viem/chains";
import { celo } from "viem/chains";
import { http } from "viem";

export const wagmiConfig = createConfig({
    chains: [celo, celoSepolia],
    transports: {
        [celo.id]: http("https://forno.celo.org"), // 🟢 Forzamos el RPC de Mainnet
        [celoSepolia.id]: http("https://alfajores.forno.celo.org"), // 🟡 Forzamos el RPC de Sepolia
    },
});