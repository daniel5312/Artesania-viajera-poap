import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const IDENTITY_REGISTRY_ABI = [
    "function setAgentURI(uint256 agentId, string calldata newURI) external",
    "function register() external returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)"
];

const IDENTITY_REGISTRY_ADDRESS = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"; // Celo Mainnet
const AGENT_ID = 9059;

async function main() {
    console.log("🤖 Iniciando actualización de Metadata para el Agente CAJERO (ERC-8004)...");

    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ ERROR: No se encontró AGENT_PRIVATE_KEY en .env.local");
        process.exit(1);
    }

    try {
        const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
        const wallet = new ethers.Wallet(privateKey, provider);
        const registry = new ethers.Contract(IDENTITY_REGISTRY_ADDRESS, IDENTITY_REGISTRY_ABI, wallet);

        // Construir la metadata en formato JSON (Cumpliendo reglas estrictas de Celopedia)
        const metadata = {
            type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
            name: "Cajero Artesania",
            description: "Agente IA autónomo del protocolo Artesanía Viajera. Encargado de enrutar pagos ReFi en Celo, USDT y G$ hacia artesanos y pools de impacto, abstrayendo la complejidad de Web3 para los viajeros.",
            image: "ipfs://bafybeigdx2hthp6y6vptd2fblz324euyv276u3euygndp2z2xcd243j6tq/guatape.jpg",
            services: [
                {
                    name: "payment_routing",
                    description: "Enrutamiento atómico x402 hacia el contrato ReFi Splitter",
                    endpoint: "https://artesania-viajera.vercel.app/api/chat"
                }
            ]
        };

        // Convertir a base64 Data URI para no depender de IPFS externo si no queremos
        const jsonString = JSON.stringify(metadata);
        const base64Data = Buffer.from(jsonString).toString('base64');
        const tokenURI = `data:application/json;base64,${base64Data}`;

        console.log(`⏳ Actualizando Agent URI para el ID ${AGENT_ID}...`);
        
        // Ejecutar la actualización en la blockchain
        const tx = await registry.setAgentURI(AGENT_ID, tokenURI);
        console.log(`🔗 Enviando transacción... Hash: ${tx.hash}`);
        await tx.wait();
        
        console.log("✅ ¡METADATA ACTUALIZADA EXITOSAMENTE!");
        console.log(`Revisa tu explorador: https://8004scan.io/agents/celo/${AGENT_ID}`);

    } catch (error: any) {
        console.error("❌ Error durante la actualización:", error.message || error);
    }
}

main();
