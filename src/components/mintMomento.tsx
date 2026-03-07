"use client";
import { useState } from "react";
import {
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Camera } from "lucide-react";
import { PASSPORT_CONTRACT } from "app/constants/contracts";

export function MintMomento() {
  const [ipfsUri, setIpfsUri] = useState("");
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleMint = () => {
    if (!address) return alert("Conecta tu wallet primero");
    writeContract({
      ...PASSPORT_CONTRACT,
      functionName: "mintMomento",
      args: [address, ipfsUri],
    });
  };

  return (
    <div className="bg-card p-4 rounded-3xl shadow-md mb-4 border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="text-primary w-5 h-5" />
        <h3 className="font-semibold text-sm text-foreground">
          Inmortaliza tu viaje
        </h3>
      </div>
      <input
        type="text"
        value={ipfsUri}
        onChange={(e) => setIpfsUri(e.target.value)}
        placeholder="Pega el enlace IPFS de tu foto..."
        className="w-full text-sm p-2 rounded-xl bg-background border border-muted mb-3 text-foreground"
        disabled={isPending || isConfirming}
      />
      <button
        onClick={handleMint}
        disabled={!ipfsUri || isPending || isConfirming || !address}
        className="w-full bg-primary text-primary-foreground py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-all"
      >
        {isPending
          ? "Firmando..."
          : isConfirming
            ? "Grabando en Celo..."
            : "Mintear Momento"}
      </button>
      {isConfirmed && (
        <p className="mt-3 text-center text-xs font-medium text-green-500">
          ¡Momento guardado en Celo! 🎉
        </p>
      )}
    </div>
  );
}
