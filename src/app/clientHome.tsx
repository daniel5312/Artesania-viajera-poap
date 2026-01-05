"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import FarcasterLoader from "@/components/farcasterLoader";
import sdk from "@farcaster/frame-sdk";
// @ts-ignore
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-zinc-900 animate-pulse rounded-3xl" />
  ),
});

export default function ClientHome() {
  const { login, authenticated, user, logout } = usePrivy();
  const [isHuman, setIsHuman] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    sdk.actions.ready();
  }, []);

  const selfApp = useMemo(() => {
    if (!mounted || !user?.wallet?.address) return null;
    try {
      return new SelfAppBuilder({
        version: 2,
        appName: "Artesania Viajera",
        scope:
          "15359325017492470634047168286756315656265970753901363455078301965319707372828",
        configId: "0x7b6436b0c90c743896504a5ee1307d61",
        userId: user.wallet.address,
        disclosures: { isHuman: true },
        endpoint: "https://api.self.xyz",
      }).build();
    } catch (e) {
      return null;
    }
  }, [mounted, user?.wallet?.address]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      <nav className="flex justify-between items-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-tighter bg-linear-to-r from-[#8162f3] to-[#eb527d] bg-clip-text text-transparent uppercase">
          Artesanía Viajera
        </h1>
        <button
          onClick={authenticated ? logout : login}
          className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full font-bold hover:bg-zinc-800 transition-all text-sm"
        >
          {authenticated
            ? `Salir (${user?.wallet?.address?.slice(0, 6)})`
            : "Conectar"}
        </button>
      </nav>

      <FarcasterLoader />

      {!isHuman ? (
        <section className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-[#8162f3] rounded-3xl space-y-6">
          <h2 className="text-2xl font-bold uppercase italic text-center">
            Verifica tu Humanidad
          </h2>
          <div className="bg-white p-6 rounded-2xl flex items-center justify-center shadow-lg w-80 h-80 overflow-hidden">
            {authenticated && selfApp ? (
              <div className="w-full h-full flex items-center justify-center scale-90">
                <SelfQRcodeWrapper
                  key={user?.wallet?.address}
                  selfApp={selfApp}
                  onSuccess={() => setIsHuman(true)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-black">
                <div className="w-8 h-8 border-4 border-[#8162f3] border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-sm">
                  {authenticated ? "Cargando QR..." : "Conecta tu Wallet"}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="relative h-[55vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
          <Mapa />
          <div className="absolute top-4 right-4 bg-green-500 text-black px-4 py-1 rounded-full font-bold text-xs animate-bounce">
            HUMANO VERIFICADO ✅
          </div>
        </section>
      )}
    </main>
  );
}
