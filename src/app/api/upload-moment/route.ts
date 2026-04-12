/*import { NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

// En App Router, para archivos grandes se configura así:
export const maxDuration = 60;

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file = data.get("file") as File;

        if (!file) return NextResponse.json({ error: "No hay archivo" }, { status: 400 });

        // Forzamos el nombre para que el SDK no se pierda
        const uploadData = await pinata.upload.file(file);

        return NextResponse.json({ success: true, ipfsUrl: uploadData.IpfsHash });
    } catch (error: any) {
        console.error("💥 Error Pinata:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Error en la subida a IPFS"
        }, { status: 500 });
    }
}*/

import { NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } }, // 🟢 Evita el error de "Payload Too Large"
};

export async function POST(request: Request) {
    try {
        const jwt = process.env.PINATA_JWT;
        const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

        if (!jwt) return NextResponse.json({ error: "Faltan credenciales" }, { status: 500 });

        const pinata = new PinataSDK({ pinataJwt: jwt, pinataGateway: gateway });
        const data = await request.formData();
        const file = data.get("file") as File;

        if (!file) return NextResponse.json({ error: "No hay archivo" }, { status: 400 });

        const uploadData = await pinata.upload.file(file);
        return NextResponse.json({ success: true, ipfsUrl: uploadData.IpfsHash }); // 🟢 Retorna el CID directo
    } catch (error: any) {
        console.error("💥 Error Pinata:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}