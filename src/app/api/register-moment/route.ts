import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions, stringToHex, pad, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { REGISTRY_CONTRACT } from "@/constants/contracts";

export async function POST(request: Request) {
    try {
        // 1. Extracción y validación de entrada
        const { puebloId, cid, recipient } = await request.json();

        // 🛡️ Seguridad: Validar que todos los datos existan y el address sea real
        if (!puebloId || !cid || !isAddress(recipient)) {
            return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 });
        }

        // 2. Configuración del Robot (Firma desde el Servidor)
        const pKey = process.env.PRIVATE_KEY as `0x${string}`;
        if (!pKey) throw new Error("Falta PRIVATE_KEY en el servidor");

        const account = privateKeyToAccount(pKey);
        const client = createWalletClient({
            account,
            chain: celo,
            transport: http("https://forno.celo.org"), // Forno es el RPC oficial de Celo
        }).extend(publicActions);

        // 3. ⚡ Conversión Senior: String -> Bytes32 (Gas Optimizer)
        // Esto debe coincidir con el mapping del contrato
        const puebloIdBytes = pad(stringToHex(puebloId), { size: 32 });

        // 4. Ejecución: El Robot paga el gas, el Turista recibe el crédito
        const hash = await client.writeContract({
            address: REGISTRY_CONTRACT.address as `0x${string}`,
            abi: REGISTRY_CONTRACT.abi,
            functionName: "registrarMomento",
            args: [puebloIdBytes, cid, recipient], // Envío exacto al nuevo contrato
        });

        console.log(`⏳ Esperando confirmación de Registro: ${hash}`);
        const receipt = await client.waitForTransactionReceipt({ hash });

        return NextResponse.json({ 
            success: true, 
            txHash: hash,
            blockNumber: receipt.blockNumber.toString() 
        });

    } catch (error: any) {
        console.error("❌ Error Robot Registry:", error.message);
        return NextResponse.json({ success: false, error: "Fallo en registro blockchain" }, { status: 500 });
    }
}