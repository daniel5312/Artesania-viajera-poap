import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoSepolia } from "viem/chains";
import { PASSPORT_CONTRACT } from "@/constants/contracts";

export const dynamic = 'force-dynamic';

const SELLOS_IPFS: Record<string, string> = {
    guatape_socalos: "https://gateway.pinata.cloud/ipfs/bafkreigqcbgkpmhml3zahydb7hq7gb373nhtjbssc4lko6su42l6tzrxf4",
    sombrillas_guatape: "https://gateway.pinata.cloud/ipfs/bafkreiegxd63qmcetnfhryf3x7uk63ayxnezqpx7nk6zup3532dzzfznu4"
};

export async function POST(request: Request) {
    try {
        const { recipient, pueblo } = await request.json();

        if (!recipient || !pueblo || !SELLOS_IPFS[pueblo]) {
            return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
        }

        // 🟢 Configuración de Viem en el Backend
        const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
        const client = createWalletClient({
            account,
            chain: celoSepolia,
            // 🟢 RPC OFICIAL DE CELO
            transport: http("https://forno.celo-sepolia.celo-testnet.org")
        }).extend(publicActions);

        const tokenURI = SELLOS_IPFS[pueblo];

        console.log(`Minteando para ${recipient}...`);

        // Ejecución de la transacción con Viem
        const hash = await client.writeContract({
            ...PASSPORT_CONTRACT,
            functionName: 'mintMomento',
            args: [recipient, tokenURI],
        });

        return NextResponse.json({
            success: true,
            txHash: hash,
            msg: `¡Sello de ${pueblo} entregado!`
        });

    } catch (error: any) {
        console.error("❌ Error en el minteo:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/*import { NextResponse } from "next/server";
import { ethers } from "ethers";
// 🟢 Ojo: Asegúrate de que esta ruta apunte al archivo abi.ts que creamos hoy
import { ArtesaniaABI } from "@/utils/ArtesaniaABI";

// Aquí ponemos los CIDs reales que sacaste de Pinata
const SELLOS_IPFS: Record<string, string> = {
    guatape_socalos: "bafkreigeqrlcc3gtrjlld7bdatruhv6uy34rfxtv4ym6ud5h6io3fdkwku",
    sombrillas_guatape: "ipfs://bafkreiblodwup66665rxrhpkzojgrolaw5zhq3psn56wp6zaqr6lmsrxhm"
};

export async function POST(request: Request) {
    try {
        // Recibimos la billetera (recipient) y el pueblo que visitó
        const { recipient, pueblo } = await request.json();

        if (!recipient || !pueblo || !SELLOS_IPFS[pueblo]) {
            return NextResponse.json({ error: "Faltan datos o pueblo inválido" }, { status: 400 });
        }

        // 1. Configurar Proveedor (HARDCODEADO: Directo a Celo Alfajores)
        const provider = new ethers.JsonRpcProvider("https://forno.celo-sepolia.celo-testnet.org");

        if (!process.env.PRIVATE_KEY) {
            return NextResponse.json({ error: "Configuración incompleta: PRIVATE_KEY" }, { status: 500 });
        }

        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // 2. Instanciar el contrato (HARDCODEADO: Tu dirección oficial a prueba de errores)
        const contract = new ethers.Contract(
            "0x86b6E480a423f49C4104EeAcC13c262263c24ee9",
            ArtesaniaABI,
            wallet
        );

        // 3. Ejecutar el regalo (Mint) con el CID exacto del pueblo
        const tokenURI = SELLOS_IPFS[pueblo];

        console.log(`Minteando sello de ${pueblo} para ${recipient}...`);
        const tx = await contract.mintMomento(recipient, tokenURI);
        const receipt = await tx.wait(); // Esperamos confirmación en la blockchain

        return NextResponse.json({
            success: true,
            txHash: receipt.hash,
            msg: `¡Pasaporte de ${pueblo} entregado exitosamente!`
        });

    } catch (error: any) {
        console.error("Error en el minteo:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}*/