import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { PASSPORT_CONTRACT } from "@/constants/contracts";
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
    process.env.PRIVY_APP_SECRET || ""
);

// 🟢 Diccionario de NFTs para mintear (Asegúrate de actualizar los CIDs genéricos con los reales)
const SELLOS_IPFS: Record<string, string> = {
    guatape_socalos: "https://gateway.pinata.cloud/ipfs/bafkreigqcbgkpmhml3zahydb7hq7gb373nhtjbssc4lko6su42l6tzrxf4",
    sombrillas_guatape: "https://gateway.pinata.cloud/ipfs/bafkreiegxd63qmcetnfhryf3x7uk63ayxnezqpx7nk6zup3532dzzfznu4",
    jardin_cafe: "https://gateway.pinata.cloud/ipfs/QmPlaceholderJardin", // ⚠️ CAMBIAR POR EL CID REAL
    envigado_verde: "https://gateway.pinata.cloud/ipfs/QmPlaceholderEnvigado", // ⚠️ CAMBIAR POR EL CID REAL
    jerico_cuero: "https://gateway.pinata.cloud/ipfs/QmPlaceholderJerico", // ⚠️ CAMBIAR POR EL CID REAL
    mompox_filigrana: "https://gateway.pinata.cloud/ipfs/QmPlaceholderMompox", // ⚠️ CAMBIAR POR EL CID REAL
    el_carmen_ceramica: "https://gateway.pinata.cloud/ipfs/QmPlaceholderElCarmen", // ⚠️ CAMBIAR POR EL CID REAL
    biota_line: "https://gateway.pinata.cloud/ipfs/QmPlaceholderBiota" // ⚠️ CAMBIAR POR EL CID REAL
};

export async function POST(request: Request) {
    try {
        // 🛡️ Validación de Sesión con Privy
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Falta el token de autorización" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        try {
            await privy.verifyAuthToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Token de sesión inválido" }, { status: 401 });
        }

        const { recipient, puebloId } = await request.json();

        // Validación de seguridad
        if (!recipient || !isAddress(recipient)) {
            return NextResponse.json({ success: false, error: "Address inválida o vacía" }, { status: 400 });
        }

        const tokenURI = SELLOS_IPFS[puebloId];
        if (!tokenURI) {
            return NextResponse.json({ success: false, error: "Sello no encontrado" }, { status: 404 });
        }

        const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
        if (!privateKey) throw new Error("Falta PRIVATE_KEY en el servidor");

        const account = privateKeyToAccount(privateKey);
        const client = createWalletClient({
            account,
            chain: celo,
            transport: http("https://forno.celo.org")
        }).extend(publicActions);

        const hash = await client.writeContract({
            address: PASSPORT_CONTRACT.address as `0x${string}`,
            abi: PASSPORT_CONTRACT.abi,
            functionName: "mintMomento",
            args: [recipient as `0x${string}`, tokenURI],
        });

        return NextResponse.json({ success: true, txHash: hash });
    } catch (error: any) {
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