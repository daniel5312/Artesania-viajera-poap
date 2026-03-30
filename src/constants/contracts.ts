// src/constants/contracts.ts
import { PASSPORT_ADDRESS, PASSPORT_ABI } from "./abis/ArtesaniaPassportABI";
import { REGISTRY_ADDRESS } from "./abis/ArtesaniaRegistryABI";
import { BADGE_ADDRESS } from "./abis/ArtesaniaBadgeABI";

// 🎨 CONTRATO DE PASAPORTE (Queda igualito, usa su propio archivo de ABI)
export const PASSPORT_CONTRACT = {
    address: PASSPORT_ADDRESS,
    abi: PASSPORT_ABI,
} as const;

// 🛡️ CONTRATO BADGE (Insignias ERC-1155 - ABI limpio inyectado)
export const BADGE_CONTRACT = {
    address: BADGE_ADDRESS,
    abi: [
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
        {
            name: "uri",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "id", type: "uint256" }],
            outputs: [{ type: "string" }]
        },
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
    ]
} as const;

// 🗃️ CONTRATO REGISTRY (Mantenemos tu "magia" de ABI limpio)
export const REGISTRY_CONTRACT = {
    address: REGISTRY_ADDRESS,
    abi: [
        {
            name: "registrarMomento",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
                { name: "_puebloId", type: "string" },
                { name: "_cid", type: "string" }
            ],
            outputs: []
        },
        {
            name: "obtenerMural",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "_puebloId", type: "string" }],
            outputs: [{
                type: "tuple[]",
                components: [
                    { name: "cid", type: "string" },
                    { name: "autor", type: "address" },
                    { name: "fecha", type: "uint256" },
                    { name: "esArtesano", type: "bool" }
                ]
            }]
        }
    ]
} as const;

export { PASSPORT_ADDRESS, REGISTRY_ADDRESS, BADGE_ADDRESS };