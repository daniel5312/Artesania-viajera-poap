import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther, getAddress } from "viem";
import { useEffect } from "react";

interface BotonCompraArtesaniaProps {
  destinatarioPago: string;
  precio: string;
  puebloId: string;
}

export function BotonCompraArtesania({
  destinatarioPago,
  precio,
  puebloId,
}: BotonCompraArtesaniaProps) {
  const { address } = useAccount();
  const { data: hash, sendTransaction, isPending } = useSendTransaction();

  // 1. Monitoreamos la transacción de pago
  const { isLoading: confirmandoPago, isSuccess: pagoExitoso } =
    useWaitForTransactionReceipt({ hash });

  // 2. Efecto: Cuando el pago sea exitoso, regalamos el NFT
  useEffect(() => {
    if (pagoExitoso) {
      entregarPremioNFT();
    }
  }, [pagoExitoso]);

  const entregarPremioNFT = async () => {
    try {
      // Llamamos a tu API que ya funciona
      const res = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: address,
          pueblo: puebloId,
        }),
      });
      alert("¡Pago recibido! Tu POAP de regalo ha sido enviado.");
    } catch (e) {
      console.error("Error regalando el NFT:", e);
    }
  };

  return (
    <button
      disabled={isPending || confirmandoPago}
      onClick={() =>
        sendTransaction({
          to: getAddress(destinatarioPago), // Tu wallet de artesano
          value: parseEther(precio), // Ejemplo: "0.5" CELO
        })
      }
      className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold"
    >
      {isPending || confirmandoPago
        ? "Procesando..."
        : `Comprar por ${precio} CELO`}
    </button>
  );
}
