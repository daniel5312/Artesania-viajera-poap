import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { ArtesaniaABI } from "@/utils/ArtesaniaABI";

export async function POST(request: Request) {
    try {
        const { recipient } = await request.json();

        // 1. Configurar Proveedor y Wallet del "Relayer"
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

        // Validamos que la llave privada esté configurada
        if (!process.env.PRIVATE_KEY) {
            return NextResponse.json({ error: "Configuración incompleta: PRIVATE_KEY" }, { status: 500 });
        }

        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // 2. Instanciar el contrato (Usando la dirección 0x86b6...)
        const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_PASSPORT_ADDRESS!,
            ArtesaniaABI,
            wallet
        );

        // 3. Ejecutar el regalo (Mint)
        // Este JSON es el que define la imagen y nombre del NFT
        const tokenURI = "https://purple-eligible-koala-155.mypinata.cloud/ipfs/QmZ...TuMetadata";

        const tx = await contract.mintMomento(recipient, tokenURI);
        const receipt = await tx.wait();

        return NextResponse.json({
            success: true,
            txHash: receipt.hash,
            msg: "¡Pasaporte Digital entregado!"
        });

    } catch (error: any) {
        console.error("Error en el minteo:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}