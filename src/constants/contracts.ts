import { PASSPORT_ADDRESS, PASSPORT_ABI } from "./abis/ArtesaniaPassportABI";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "./abis/ArtesaniaRegistryABI";

/**
 * 🎨 CONTRATO DE PASAPORTE (NFTs)
 * Se usa para: ver tus fotos (tokenURI) y ver cuántas tienes (balanceOf).
 */
export const PASSPORT_CONTRACT = {
    address: PASSPORT_ADDRESS,
    abi: PASSPORT_ABI,
} as const;

/**
 * 🗃️ CONTRATO REGISTRY
 * Se usa para: la lógica de registro global de artesanos o sellos.
 */
export const REGISTRY_CONTRACT = {
    address: REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
} as const;

// Exportamos las direcciones por separado por si necesitas armar un link a CeloScan
export { PASSPORT_ADDRESS, REGISTRY_ADDRESS };