// src/constants/abis/ArtesaniaBadgeABI.ts

// 🟢 Dirección del contrato (Cámbiala tras el deploy en Sepolia)
export const BADGE_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export const BADGE_ABI = [
    // 🏷️ Identidad de la colección
    {
        name: "name",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "string" }]
    },
    // ⚒️ Mint Individual (Para cuando el GPS detecta que estás ahí)
    {
        name: "mintBadge",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "id", type: "uint256" }
        ],
        outputs: []
    },
    // Mint por Lotes (El pro-tip para ahorrar gas si reclama varios sellos)
    {
        name: "mintBatchBadges",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "ids", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" }
        ],
        outputs: []
    },
    // ✨ Check de Posesión (Clave para el efecto GLOW en el dashboard)
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "account", type: "address" },
            { name: "id", type: "uint256" }
        ],
        outputs: [{ type: "uint256" }]
    },
    //  Metadata e IA (Para traer la historia del sitio desde IPFS)
    {
        name: "uri",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "id", type: "uint256" }],
        outputs: [{ type: "string" }]
    },
    //  Configuración (Solo para tu panel de admin)
    {
        name: "configurarSitio",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "id", type: "uint256" },
            { name: "metadataUri", type: "string" }
        ],
        outputs: []
    }
] as const;