// src/constants/contracts.ts
import { PASSPORT_ADDRESS, PASSPORT_ABI } from "./abis/ArtesaniaPassportABI";
import { REGISTRY_ADDRESS } from "./abis/ArtesaniaRegistryABI";
import { BADGE_ADDRESS } from "./abis/ArtesaniaBadgeABI";
import { REFI_SPLITTER_ABI, COLLECTIVE_SPLITTER_ADDRESS, TREASURY_SPLITTER_ADDRESS } from "./abis/ReFiSplitterABI";

// 🌱 CONTRATO REFI SPLITTER
export const REFI_SPLITTER_CONTRACT = {
    abi: REFI_SPLITTER_ABI,
    addressCollective: COLLECTIVE_SPLITTER_ADDRESS,
    addressTreasury: TREASURY_SPLITTER_ADDRESS,
} as const;

// 🎨 CONTRATO DE PASAPORTE (Mismo archivo de siempre)
export const PASSPORT_CONTRACT = {
    address: PASSPORT_ADDRESS,
    abi: PASSPORT_ABI,
} as const;

// 🛡️ CONTRATO BADGE (ERC-1155)
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

// 🗃️ CONTRATO REGISTRY (Versión Optimizada v0.8.28)
export const REGISTRY_CONTRACT = {
    address: REGISTRY_ADDRESS,
    abi: [
        {
            name: "registrarMomento",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
                { name: "_puebloId", type: "bytes32" }, // 🟢 1. Bytes32 (Gas saver)
                { name: "_cid", type: "string" },      // 🟢 2. Hash IPFS
                { name: "_viajero", type: "address" }   // 🟢 3. El Turista real (Recipient)
            ],
            outputs: []
        },
        {
            name: "obtenerMural",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "_puebloId", type: "bytes32" }], // 🟢 También bytes32 aquí
            outputs: [{
                type: "tuple[]",
                components: [
                    { name: "autor", type: "address" },
                    { name: "fecha", type: "uint40" },    // 🟢 uint40 (Storage packing)
                    { name: "esArtesano", type: "bool" },
                    { name: "cid", type: "string" }
                ]
            }]
        }
    ]
} as const;

export { PASSPORT_ADDRESS, REGISTRY_ADDRESS, BADGE_ADDRESS };