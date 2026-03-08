// src/constants/contracts.ts
import { PASSPORT_ADDRESS, PASSPORT_ABI } from "./abis/ArtesaniaPassportABI";
import { REGISTRY_ADDRESS } from "./abis/ArtesaniaRegistryABI";
// ☝️ Fíjate que arriba YA NO importamos REGISTRY_ABI, solo la dirección.

// 🎨 CONTRATO DE PASAPORTE (Queda igualito)
export const PASSPORT_CONTRACT = {
    address: PASSPORT_ADDRESS,
    abi: PASSPORT_ABI,
} as const;

// 🗃️ CONTRATO REGISTRY (Aquí está la magia: le damos el ABI limpio a la fuerza)
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

export { PASSPORT_ADDRESS, REGISTRY_ADDRESS };