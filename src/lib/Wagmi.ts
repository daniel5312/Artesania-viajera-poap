import { createConfig } from "@privy-io/wagmi";
import { celoSepolia } from "viem/chains";
import { http } from "viem";

export const wagmiConfig = createConfig({
    // 🟢 Solo dejamos Celo Sepolia para evitar confusiones en MetaMask
    chains: [celoSepolia],
    transports: {
        [celoSepolia.id]: http(),
    },
});