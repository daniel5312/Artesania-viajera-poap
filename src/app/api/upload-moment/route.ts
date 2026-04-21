/*import { NextResponse } from "next/server";

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

// 🟢 En App Router la configuración de tamaño se maneja diferente o es automática en local
// Pero eliminamos el 'export const config' porque es solo para Pages Router.

export async function POST(request: Request) {
    console.log("🚀 [API] Iniciando subida manual a Pinata...");
    try {
        const jwt = process.env.PINATA_JWT;
        if (!jwt) {
            return NextResponse.json({ error: "Faltan credenciales" }, { status: 500 });
        }

        const data = await request.formData();
        const file = data.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No hay archivo" }, { status: 400 });
        }

        // 🟢 Petición Manual a la API de Pinata (Más compatible con Node 18+)
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("❌ Error API Pinata:", errorData);
            throw new Error(errorData.error?.details || "Error en Pinata");
        }

        const uploadData = await res.json();
        console.log("✅ Éxito Manual. CID:", uploadData.IpfsHash);

        return NextResponse.json({ success: true, ipfsUrl: uploadData.IpfsHash });
    } catch (error: any) {
        console.error("💥 Fallo Crítico Subida:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}