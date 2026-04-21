import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains"; // O celoSepolia si sigues en testnet
import { BADGE_CONTRACT } from "@/constants/contracts";
import { PrivyClient } from "@privy-io/server-auth";

export const dynamic = 'force-dynamic';

const privy = new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
    process.env.PRIVY_APP_SECRET || ""
);

export async function POST(request: Request) {
    try {
        // 🛡️ Validación de Sesión con Privy
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Falta el token de autorización" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let verifiedUser;
        try {
            verifiedUser = await privy.verifyAuthToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Token de sesión inválido" }, { status: 401 });
        }

        const { recipient, badgeId } = await request.json();

        // 🛡️ Validación básica de seguridad
        if (!recipient || !badgeId) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        // 🔑 El Robot usa la llave secreta de Vercel (Nunca se expone al cliente)
        const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

        const client = createWalletClient({
            account,
            chain: celo,
            transport: http("https://forno.celo.org") // RPC Oficial
        }).extend(publicActions);

        console.log(`🤖 Robot Iniciando Mint: Badge ${badgeId} -> ${recipient}`);

        // ⚡ Ejecución de la transacción (El servidor firma y paga)
        const hash = await client.writeContract({
            ...BADGE_CONTRACT,
            functionName: 'mintBadge',
            args: [recipient, BigInt(badgeId)],
        });

        console.log(`⏳ Esperando confirmación de Bloque: ${hash}`);
        const receipt = await client.waitForTransactionReceipt({ hash });
        console.log(`✅ Confirmado en bloque: ${receipt.blockNumber}`);

        return NextResponse.json({
            success: true,
            txHash: hash,
            blockNumber: receipt.blockNumber.toString(),
            msg: "¡Insignia entregada y confirmada en la Blockchain! 🪄"
        });

    } catch (error: any) {
        console.error("❌ Error en el Robot de Mint:", error);
        return NextResponse.json({
            success: false,
            error: error.shortMessage || error.message
        }, { status: 500 });
    }
}