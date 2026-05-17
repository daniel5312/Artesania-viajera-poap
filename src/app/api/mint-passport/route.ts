import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { PASSPORT_CONTRACT } from "@/constants/contracts";

// ¡ATENCIÓN! Estos son los CIDs CORREGIDOS. Tus originales tenían un error de JSON.
const SELLOS_IPFS: Record<string, string> = {
    guatape_socalos: "ipfs://bafkreigqcbgkpmhml3zahydb7hq7gb373nhtjbssc4lko6su42l6tzrxf4",
    sombrillas_guatape: "ipfs://bafkreiegxd63qmcetnfhryf3x7uk63ayxnezqpx7nk6zup3532dzzfznu4",
    jardin_cafe: "ipfs://QmPENDING_Jardin",
    santafe_de_antioquia: "ipfs://QmPENDING_SantaFe"
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const recipient = body.recipient;
        const pueblo = body.puebloId || body.pueblo; 

        if (!recipient || !pueblo || !SELLOS_IPFS[pueblo]) {
            return NextResponse.json({ error: "Faltan datos o pueblo inválido" }, { status: 400 });
        }

        // Configuración original (Directo a Celo Mainnet con Ankr)
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_CELO_RPC_URL || "https://rpc.ankr.com/celo");

        if (!process.env.PRIVATE_KEY) {
            return NextResponse.json({ error: "Configuración incompleta: PRIVATE_KEY" }, { status: 500 });
        }

        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        const contractAddress = PASSPORT_CONTRACT.address as `0x${string}`;
        const contract = new ethers.Contract(
            contractAddress,
            PASSPORT_CONTRACT.abi,
            wallet
        );

        const tokenURI = SELLOS_IPFS[pueblo];

        console.log(`Minteando sello ORIGINAL de ${pueblo} para ${recipient}...`);
        const tx = await contract.mintMomento(recipient, tokenURI);
        const receipt = await tx.wait();

        return NextResponse.json({
            success: true,
            txHash: receipt.hash,
            msg: `¡Pasaporte original de ${pueblo} entregado exitosamente!`
        });

    } catch (error: any) {
        console.error("Error en el minteo:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}