"use client";
import { useState, useEffect, useMemo } from "react"; // Cambio: añadido useEffect y useState
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import FarcasterLoader from "@/components/farcasterLoader";
import sdk from "@farcaster/frame-sdk"; // Cambio: Import SDK Farcaster
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode"; // Cambio: Import Self Protocol

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] w-full bg-zinc-900 animate-pulse rounded-3xl" />
  ),
});

export default function ClientHome() {
  const { login, authenticated, user, logout } = usePrivy();
  const [isHuman, setIsHuman] = useState(false); // Estado para track de Identidad

  // Cambio: Inicialización obligatoria para Track Farcaster
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Configuración de Self Protocol
  const selfApp = useMemo(() => {
    return new SelfAppBuilder({
      version: 2,
      appName: "Artesania Viajera",
      scope: "human-check",
      userId:
        user?.wallet?.address || "0x0000000000000000000000000000000000000000",
      disclosures: { isHuman: true },
      endpoint: "https://api.self.xyz",
    }).build();
  }, [user?.wallet?.address]);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a]">
      <nav className="flex justify-between items-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-tighter bg-linear-to-r from-[#8162f3] to-[#eb527d] bg-clip-text text-transparent uppercase">
          Artesanía Viajera
        </h1>
        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
          {user?.wallet?.address}
        </p>
        <button
          onClick={authenticated ? logout : login}
          className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full font-bold hover:bg-zinc-800 transition-all text-sm"
        >
          {authenticated
            ? `Salir (${user?.email?.address?.slice(0, 6)})`
            : "Conectar"}
        </button>
      </nav>

      <FarcasterLoader />

      {/* Cambio: Condicional para mostrar QR de Self o el Mapa */}
      {!isHuman ? (
        <section className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-[#8162f3] rounded-3xl space-y-6">
          <h2 className="text-2xl font-bold uppercase italic">
            Verifica tu Humanidad
          </h2>
          <div className="bg-white p-4 rounded-2xl">
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={() => setIsHuman(true)}
            />
          </div>
          <p className="text-zinc-400">
            Escanea con Self para desbloquear el mapa.
          </p>
        </section>
      ) : (
        <section className="relative h-[55vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl animate-in fade-in">
          <Mapa />
          <div className="absolute top-4 right-4 bg-green-500 text-black px-4 py-1 rounded-full font-bold text-xs animate-bounce">
            HUMANO VERIFICADO ✅
          </div>
        </section>
      )}

      <div className="text-center space-y-4 py-10">
        <h2 className="text-5xl font-bold italic tracking-tighter uppercase">
          Explora el Arte Vivo
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto text-lg">
          Verifica tu identidad con{" "}
          <span className="text-[#8162f3] font-mono">Self Protocol</span> y
          colecciona Badges en Celo.
        </p>
      </div>
    </main>
  );
}
