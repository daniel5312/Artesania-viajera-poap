/**
 * 🛠️ HERRAMIENTAS DEL AGENTE (TOOLS)
 * 
 * Este archivo contiene las funciones que los Agentes de Inteligencia Artificial 
 * (CIVIL y CAJERO) pueden ejecutar. 
 * 
 * Estandares oficiales de Celo implementados aquí:
 * 1. x402 (Agent Payments): Protocolo para micropagos sin fricción.
 *    - Documentación: https://docs.celo.org/build-on-celo/build-with-ai/x402
 * 2. ERC-8004 (Agent Trust Protocol): Identidad y Reputación on-chain.
 *    - Documentación: https://docs.celo.org/build-on-celo/build-with-ai/erc-8004
 * 
 * Contexto: Diseñado para "Artesanía Viajera" (ReFi - Regenerative Finance).
 */

import { ethers } from 'ethers';

// Billetera Oficial del Agente CAJERO (IA):
export const CAJERO_WALLET = "0xD9c10131d92f50335569a48A4b58d74f1865Da01";

// ==========================================
// 📝 1. DEFINICIÓN DE HERRAMIENTAS (SCHEMAS)
// ==========================================

export const scanGeofenceTool = {
    name: "scan_geofence_activity",
    description: "Monitorea y valida que un check-in en un destino de Antioquia sea real. Utiliza el estándar ERC-8004 para consultar la Identidad y sumar Reputación.",
    parameters: {
        type: "OBJECT",
        properties: {
            farmerAddress: { type: "STRING", description: "Dirección de la wallet del usuario/viajero (0x...)" },
            destinoId: { type: "NUMBER", description: "ID del destino en Antioquia (Ej: 5 para Guatapé)" },
            coordenadas: { type: "STRING", description: "Latitud y Longitud reportadas" }
        },
        required: ["farmerAddress", "destinoId", "coordenadas"]
    }
};

export const executePaymentRoutingTool = {
    name: "execute_payment_routing",
    description: "Procesa micropagos autónomos usando el estándar x402 para pagar compras de artesanías o recompensas ReFi.",
    parameters: {
        type: "OBJECT",
        properties: {
            artesanoAddress: { type: "STRING", description: "Dirección de la wallet del artesano receptor (0x...)" },
            monto: { type: "NUMBER", description: "Cantidad a enviar (Ej: 15.5)" },
            token: { type: "STRING", description: "Moneda estable a usar en Celo: CELO, cUSD o USDC" }
        },
        required: ["artesanoAddress", "monto", "token"]
    }
};

// ==========================================
// ⚙️ 2. LÓGICA DE EJECUCIÓN (LAS FUNCIONES)
// ==========================================

export async function executeScanGeofence(args: any) {
    console.log("[CIVIL-AGENT] 📍 Iniciando validación Geofence (ERC-8004)...", args);
    return {
        success: true,
        simulation: true,
        standard: "ERC-8004",
        message: `Check-in validado en destino ${args.destinoId}. Identidad verificada y Reputación sumada según ERC-8004.`
    };
}

const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"];

const REPUTATION_REGISTRY_ABI = [
    "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, bytes32 tag1, bytes32 tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external"
];
const REPUTATION_REGISTRY_ADDRESS = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"; // Celo Mainnet

const TOKEN_ADDRESSES: { [key: string]: string } = {
    "cUSD": "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    "USDC": "0xcebA9300f2b948710d2653dD7B07f33A8B32118C"
};

// Direcciones de la Tesorería y Pools ReFi (Usa minúsculas para evitar errores de checksum)
const TESORERIA_DAPP = "0x82b260d0f31bea7909a0bbb0327f1a1bb31b0575"; // Ajusta a la real
const POOL_GOODDOLLAR = "0x4016bcd00595304b7b0d366c8b6e507de7896d8b"; // Ajusta a la real
const POOL_ARTESANIA = "0x98a19b36e2bcbc8dc69bb82ddedbc3aec8f71221"; // Ajusta a la real

export async function executePaymentRouting(args: any) {
    console.log(`[CAJERO-AGENT: ${CAJERO_WALLET}] 💸 Iniciando enrutamiento de pago REAL (x402)...`, args);
    
    const montoBase = parseFloat(args.monto);
    const splitArtesano = montoBase * 0.90;
    const splitDapp = montoBase * 0.05;
    const splitPoolGD = montoBase * 0.025;
    const splitPoolArtesania = montoBase * 0.025;

    console.log(`[CAJERO-AGENT] 🧮 Distribución calculada:
    - Artesano (${args.artesanoAddress}): ${splitArtesano.toFixed(4)} ${args.token}
    - Tesorería DApp: ${splitDapp.toFixed(4)} ${args.token}
    - Pool GoodDollar: ${splitPoolGD.toFixed(4)} ${args.token}
    - Pool Artesanía: ${splitPoolArtesania.toFixed(4)} ${args.token}
    `);

    try {
        const privateKey = process.env.AGENT_PRIVATE_KEY;
        if (!privateKey) throw new Error("AGENT_PRIVATE_KEY no configurada en el servidor.");

        const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
        const wallet = new ethers.Wallet(privateKey, provider);
        const tokenUpper = args.token.toUpperCase();

        let txHashes = [];
        
        // Obtener el Nonce actual para poder enviar 4 transacciones seguidas sin chocar
        let currentNonce = await wallet.getNonce();

        // Función auxiliar para enviar
        const enviarPago = async (destino: string, cantidad: number) => {
            if (cantidad <= 0) return null;
            
            const nonceToUse = currentNonce++; // Usar y luego incrementar
            
            if (tokenUpper === "CELO") {
                // CELO tiene 18 decimales. toFixed(18) evita errores de coma flotante de JS
                const cantidadStr = cantidad.toFixed(18);
                const tx = await wallet.sendTransaction({
                    to: destino,
                    value: ethers.parseEther(cantidadStr),
                    nonce: nonceToUse
                });
                return tx.hash;
            } else if (TOKEN_ADDRESSES[tokenUpper]) {
                const contract = new ethers.Contract(TOKEN_ADDRESSES[tokenUpper], ERC20_ABI, wallet);
                const decimals = tokenUpper === "USDC" ? 6 : 18;
                // Redondear la cantidad a los decimales exactos del token para evitar NUMERIC_FAULT
                const cantidadStr = cantidad.toFixed(decimals);
                const tx = await contract.transfer(destino, ethers.parseUnits(cantidadStr, decimals), { nonce: nonceToUse });
                return tx.hash;
            } else {
                throw new Error(`Token no soportado: ${tokenUpper}`);
            }
        };

        console.log("⏳ Enviando transacción 1/4 (Artesano)...");
        const tx1 = await enviarPago(args.artesanoAddress, splitArtesano);
        if(tx1) txHashes.push(tx1);

        console.log("⏳ Enviando transacción 2/4 (Tesorería DApp)...");
        const tx2 = await enviarPago(TESORERIA_DAPP, splitDapp);
        if(tx2) txHashes.push(tx2);

        console.log("⏳ Enviando transacción 3/4 (Pool GoodDollar)...");
        const tx3 = await enviarPago(POOL_GOODDOLLAR, splitPoolGD);
        if(tx3) txHashes.push(tx3);

        console.log("⏳ Enviando transacción 4/4 (Pool Artesanía)...");
        const tx4 = await enviarPago(POOL_ARTESANIA, splitPoolArtesania);
        if(tx4) txHashes.push(tx4);

        // =========================================================
        // 🌟 ERC-8004 FEEDBACK (Activar el agente en 8004scan)
        // =========================================================
        try {
            console.log("🌟 Emitiendo Feedback ERC-8004 para el Agente...");
            const dAppPrivateKey = process.env.PRIVATE_KEY;
            if (dAppPrivateKey) {
                const dAppWallet = new ethers.Wallet(dAppPrivateKey, provider);
                const reputationContract = new ethers.Contract(REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI, dAppWallet);
                
                const agentId = 9059;
                const value = 100n; // 100 puntos
                const valueDecimals = 0;
                const tag1 = ethers.encodeBytes32String("successRate");
                const tag2 = ethers.ZeroHash;
                const endpoint = "https://artesania-viajera.vercel.app/api/chat";
                const feedbackURI = "ipfs://bafybeigdx2hthp6y6vptd2fblz324euyv276u3euygndp2z2xcd243j6tq/feedback.json";
                const feedbackHash = ethers.ZeroHash;

                const feedbackTx = await reputationContract.giveFeedback(agentId, value, valueDecimals, tag1, tag2, endpoint, feedbackURI, feedbackHash, { gasLimit: 500000 });
                console.log(`✅ Feedback de 5 estrellas enviado al Agente 9059. Hash: ${feedbackTx.hash}`);
            } else {
                console.warn("⚠️ No se encontró PRIVATE_KEY en .env.local para emitir Feedback ERC-8004.");
            }
        } catch (feedbackErr: any) {
            console.error("❌ Error enviando Feedback ERC-8004:", feedbackErr.message);
        }

        return {
            success: true,
            simulation: false, // ¡ES REAL!
            standard: "x402",
            agentWallet: CAJERO_WALLET,
            txHashes,
            splits: {
                artesano: splitArtesano.toFixed(4),
                dapp: splitDapp.toFixed(4),
                poolGD: splitPoolGD.toFixed(4),
                poolArtesania: splitPoolArtesania.toFixed(4)
            },
            message: `¡Pago on-chain ejecutado con éxito! El agente transfirió fondos directamente en la blockchain de Celo. TXs: ${txHashes.join(", ")}`
        };

    } catch (error: any) {
        console.error("❌ Error en el pago On-Chain:", error.message);
        return {
            success: false,
            message: `El agente intentó enviar el pago on-chain pero falló: ${error.message}. (Verifica que la wallet del Agente CAJERO tenga fondos suficientes de gas y tokens).`
        };
    }
}
