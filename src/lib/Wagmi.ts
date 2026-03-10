import { createConfig } from "@privy-io/wagmi";
//import { celoSepolia } from "viem/chains";
import { celo } from "viem/chains";
import { http } from "viem";

export const wagmiConfig = createConfig({
    // 🟢 Solo dejamos Celo Sepolia para evitar confusiones en MetaMask
    chains: [celo],
    transports: {
        [celo.id]: http(),
    },
});