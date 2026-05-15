import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// ABI mínimo para interactuar con IdentityRegistry (ERC-8004)
const IDENTITY_REGISTRY_ABI = [
    "function register() external returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "event Registered(uint256 indexed agentId, string tokenURI, address indexed owner)"
];

const IDENTITY_REGISTRY_ADDRESS = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"; // Celo Mainnet

async function main() {
    console.log("🤖 Iniciando bypass para Registro de Agente en ERC-8004...");

    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ ERROR: No se encontró AGENT_PRIVATE_KEY en .env.local");
        process.exit(1);
    }

    try {
        const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
        const wallet = new ethers.Wallet(privateKey, provider);
        const registry = new ethers.Contract(IDENTITY_REGISTRY_ADDRESS, IDENTITY_REGISTRY_ABI, wallet);

        console.log(`⏳ Verificando si la wallet ${wallet.address} ya está registrada...`);
        const balance = await registry.balanceOf(wallet.address);

        if (balance > 0n) {
            console.log("✅ ¡El agente ya estaba registrado en la blockchain!");
            
            console.log("🔍 Buscando el Agent ID en el historial de la blockchain...");
            const filter = registry.filters.Registered(null, null, wallet.address);
            const logs = await registry.queryFilter(filter, -100000, 'latest'); // Buscar en bloques recientes o desde el inicio
            
            if (logs.length > 0) {
                const agentId = (logs[0] as any).args[0];
                console.log("-----------------------------------------");
                console.log(`🆔 AGENT ID (Cédula Oficial): ${agentId.toString()}`);
                console.log("-----------------------------------------");
                console.log("¡Guarda este Agent ID! Es lo que presentarás a los jueces de Celo.");
            } else {
                console.log("⚠️ Estás registrado, pero el ID es muy antiguo para leerlo rápido.");
                console.log("Por favor registra una NUEVA Billetera para la IA o usa CeloScan para ver los tokens NFT de tu wallet.");
            }
            return;
        }

        console.log("⏳ Registrando nueva identidad en la blockchain...");
        const tx = await registry.register();
        console.log(`🔗 Enviando transacción... Hash: ${tx.hash}`);
        const receipt = await tx.wait();
        
        console.log("✅ ¡REGISTRO EXITOSO!");
        let agentId = "Desconocido (revisa CeloScan)";
        
        // Extraer Agent ID de los logs del recibo
        for (const log of receipt.logs) {
            try {
                const parsed = registry.interface.parseLog(log);
                if (parsed && parsed.name === "Registered") {
                    agentId = parsed.args[0].toString();
                }
            } catch (e) {}
        }
        
        console.log("-----------------------------------------");
        console.log(`🆔 AGENT ID (Cédula Oficial): ${agentId}`);
        console.log("-----------------------------------------");
        console.log("¡Guarda este Agent ID! Es lo que presentarás a los jueces de Celo.");

    } catch (error: any) {
        console.error("❌ Error durante el registro:", error.message || error);
    }
}

main();
