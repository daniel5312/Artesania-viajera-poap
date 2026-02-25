"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { useRouter } from "next/navigation"; // 🟢 Importamos el enrutador de Next.js

export default function ClaimButton({ location }: { location: string }) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!authenticated) {
      login();
      return;
    }

    setLoading(true);
    const address = wallets[0]?.address;

    if (address) {
      // 🟢 NUEVO FLUJO: Convertimos "Santa Fe" en "santa-fe" para la URL
      const rutaAmigable = location.toLowerCase().replace(/\s+/g, "-");

      // En vez de ir a POAP, vamos a tu propia página de reclamo
      router.push(`/reclamar/${rutaAmigable}`);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="relative z-50 pointer-events-auto mt-2 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
    >
      {loading
        ? "CARGANDO..."
        : authenticated
          ? "RECLAMAR SELLO AQUÍ"
          : `CONECTAR EN ${location}`}
    </button>
  );
}

//Conexion POAP
/*"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function ClaimButton({ location }: { location: string }) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!authenticated) return login();

    setLoading(true);
    const address = wallets[0]?.address;

    if (address) {
      // Flujo: Redirige a la App de POAP para subir el momento
      window.location.href = "https://app.poap.xyz/scan";
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="relative z-9999 pointer-events-auto mt-2 w-full py-2 bg-[#8162f3] text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform disabled:opacity-50"
      style={{ cursor: "pointer", display: "block" }}
    >
      {loading
        ? "PROCESANDO..."
        : authenticated
        ? "SUBIR MOMENTO"
        : `CONECTAR EN ${location}`}
    </button>
  );
}*/
