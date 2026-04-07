import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains"; // O celoSepolia si sigues en testnet
import { BADGE_CONTRACT } from "@/constants/contracts";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
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

        return NextResponse.json({
            success: true,
            txHash: hash,
            msg: "¡Insignia entregada por el Robot! 🪄"
        });

    } catch (error: any) {
        console.error("❌ Error en el Robot de Mint:", error);
        return NextResponse.json({
            success: false,
            error: error.shortMessage || error.message
        }, { status: 500 });
    }
}