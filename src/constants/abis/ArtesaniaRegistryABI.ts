// 👉 CELO SEPOLIA (Testnet) 🔥 ACTIVA
export const REGISTRY_ADDRESS = "0x0879d58Fe38da42C9a4fBb24faF721A8A4e1CE08" as const;

// 👉 CELO MAINNET (Producción)
// export const ARTESANIA_CONTRACT_ADDRESS = "0x..." as const;

export const REGISTRY_ABI = [
    {
        inputs: [{ internalType: "address", name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "string", name: "tokenURI", type: "string" }
        ],
        name: "mintMomento",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    }
] as const;