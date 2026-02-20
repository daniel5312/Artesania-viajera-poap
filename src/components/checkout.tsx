"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";

const RECEIVER_WALLET = "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b";
const CCOP_TOKEN_ADDRESS = "0x... (Opcional)";

export default function Checkout() {
  const { wallets } = useWallets();
  const { user, authenticated, login } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "paying" | "minting" | "success">(
    "idle",
  );

  const processPayment = async (method: "CELO" | "COP") => {
    if (!authenticated) return login();
    setLoading(true);
    setStep("paying");

    try {
      const wallet = wallets[0];
      if (!wallet) {
        alert("Por favor, conecta tu wallet primero.");
        setLoading(false);
        setStep("idle");
        return;
      }

      // 1. FORZAR LA RED CELO SEPOLIA (ID 11142220) PARA EVITAR CONFLICTOS
      await wallet.switchChain(11142220);

      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      if (method === "CELO") {
        const tx = await signer.sendTransaction({
          to: RECEIVER_WALLET,
          value: ethers.parseEther("0.1"),
        });
        await tx.wait();
      } else {
        alert("Simulando transferencia de 50,000 cCOP...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setStep("minting");
      const response = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: wallet.address,
          tipo: "Manilla Guatapé",
        }),
      });

      if (response.ok) {
        setStep("success");
      } else {
        throw new Error("Error en el minteo");
      }
    } catch (error: any) {
      console.error("Error en checkout:", error);
      // 2. MOSTRAR EL ERROR REAL EN PANTALLA
      alert(
        "Error: " +
          (error?.info?.error?.message ||
            error?.message ||
            "Revisa la consola"),
      );
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="bg-green-900/20 border border-green-500 p-6 rounded-3xl text-center">
        <h3 className="text-2xl font-bold text-green-400">
          ¡Compra Exitosa! 🎊
        </h3>
        <p className="text-sm text-zinc-300">
          Tu Pasaporte Digital ha sido activado. Revisa tu perfil.
        </p>
        <button
          onClick={() => setStep("idle")}
          className="mt-4 text-xs underline"
        >
          Comprar otra
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">Manilla Artesanal</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Edición Guatapé
          </p>
        </div>
        <span className="bg-[#8162f3]/20 text-[#8162f3] text-[10px] px-2 py-1 rounded-full font-bold">
          TOP VENTAS
        </span>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => processPayment("CELO")}
          disabled={loading}
          className="w-full py-4 bg-white text-black rounded-2xl font-black flex justify-between px-6 hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          <span>PAGAR CON CELO</span>
          <span>0.1 CELO</span>
        </button>

        <button
          onClick={() => processPayment("COP")}
          disabled={loading}
          className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-black flex justify-between px-6 hover:scale-[1.02] transition-transform border border-zinc-700 disabled:opacity-50"
        >
          <span>PAGAR CON cCOP</span>
          <span>$50,000</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-purple-400 animate-pulse">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
          {step === "paying"
            ? "Confirmando pago en blockchain..."
            : "Minteando tu Pasaporte..."}
        </div>
      )}
    </div>
  );
}
