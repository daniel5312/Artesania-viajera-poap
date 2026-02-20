"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import FarcasterLoader from "@/components/farcasterLoader";
import sdk from "@farcaster/frame-sdk";
import Checkout from "@/components/checkout"; // <--- AGREGA ESTO

// Importaciones dinámicas para evitar errores de hidratación
const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-zinc-900 animate-pulse rounded-3xl" />
  ),
});

const MomentosGrid = dynamic(() => import("@/components/momentosGrid"), {
  ssr: false,
});

export default function ClientHome() {
  const { login, authenticated, user, logout } = usePrivy();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) {
      sdk.actions.ready();
    }
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      {/* --- NAVBAR ORIGINAL RECUPERADO --- */}
      <nav className="flex justify-between items-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-tighter bg-linear-to-tr from-[#8162f3] to-[#eb527d] bg-clip-text text-transparent uppercase">
          Artesanía Viajera
        </h1>
        <div className="flex gap-4 items-center">
          {authenticated && (
            <span className="hidden md:block text-[10px] text-zinc-500 font-mono">
              {user?.wallet?.address?.slice(0, 6)}...
              {user?.wallet?.address?.slice(-4)}
            </span>
          )}
          <button
            onClick={authenticated ? logout : login}
            className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full font-bold hover:bg-zinc-800 transition-all text-sm text-white"
          >
            {authenticated ? "Salir" : "Conectar Wallet"}
          </button>
        </div>
      </nav>

      <FarcasterLoader />

      {/* --- SECCIÓN DEL MAPA (Ahora siempre visible) --- */}
      <section className="relative h-[45vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Mapa />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-purple-400">
          Explora Antioquia 📍
        </div>
      </section>

      {/* --- SECCIÓN DE MOMENTOS (Lo que hablamos) --- */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            Mi Pasaporte Digital
          </h2>
          <p className="text-zinc-500 text-sm">
            Tus recuerdos irrefutables en la blockchain de Celo.
          </p>
        </div>

        {authenticated ? (
          <MomentosGrid />
        ) : (
          <div className="p-12 bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl text-center space-y-6">
            <div className="space-y-2">
              <p className="text-zinc-400 font-medium">
                Inicia sesión para empezar a coleccionar tus momentos
                artesanales.
              </p>
              <p className="text-xs text-zinc-600">
                Al conectar, se creará tu pasaporte único.
              </p>
            </div>
            <button
              onClick={login}
              className="px-10 py-4 bg-linear-to-tr from-[#8162f3] to-[#eb527d] rounded-full font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(129,98,243,0.3)]"
            >
              Conectar Ahora
            </button>
          </div>
        )}
      </section>

      {/* --- FOOTER DE CONFIANZA --- */}
      <footer className="pt-20 pb-10 text-center space-y-4">
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.5em]">
          Powered by Celo Sepolia & Privy
        </p>
      </footer>
    </main>
  );
}
