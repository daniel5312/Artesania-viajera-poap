"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http } from "viem";
import { celoSepolia } from "viem/chains";
// ✅ Corregido el nombre de la carpeta y el export
import { PASSPORT_CONTRACT } from "@/constants/contracts";
import { Loader2 } from "lucide-react";

const MapaReal = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-zinc-900 animate-pulse flex items-center justify-center rounded-[40px]">
      <Loader2 className="animate-spin text-primary" />
    </div>
  ),
});

const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http(),
});

export function PasaporteView() {
  const { user, authenticated } = usePrivy();
  const [cantidadSellos, setCantidadSellos] = useState(0);
  const [sellos, setSellos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const audioSello = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // ⚠️ Nota: Si esto te da error de CSP en Chrome, puedes comentarlo
    audioSello.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3",
    );
  }, []);

  const leerPasaporte = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) return;
    setCargando(true);
    try {
      // ✅ Usamos PASSPORT_CONTRACT.address y PASSPORT_CONTRACT.abi
      const balance = await publicClient.readContract({
        ...PASSPORT_CONTRACT,
        functionName: "balanceOf",
        args: [user.wallet.address as `0x${string}`],
      });
      setCantidadSellos(Number(balance));

      const nuevosSellos = [];
      // Loop para buscar los NFTs (del 0 al balance o IDs específicos)
      for (let i = 0; i < 50; i++) {
        try {
          const owner = await publicClient.readContract({
            ...PASSPORT_CONTRACT,
            functionName: "ownerOf",
            args: [BigInt(i)],
          });

          if (owner.toLowerCase() === user.wallet.address.toLowerCase()) {
            const uri = (await publicClient.readContract({
              ...PASSPORT_CONTRACT,
              functionName: "tokenURI",
              args: [BigInt(i)],
            })) as string;

            const res = await fetch(
              uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
            );
            const metadata = await res.json();
            nuevosSellos.push({
              ...metadata,
              image: metadata.image.replace(
                "ipfs://",
                "https://gateway.pinata.cloud/ipfs/",
              ),
              id: i,
            });
          }
        } catch (e) {
          continue;
        }
      }
      setSellos(nuevosSellos);
    } catch (error) {
      console.error("❌ Error en leerPasaporte:", error);
    } finally {
      setCargando(false);
    }
  }, [authenticated, user?.wallet?.address]);

  useEffect(() => {
    leerPasaporte();
  }, [leerPasaporte]);

  const mintear = async (puebloId: string) => {
    if (!user?.wallet?.address)
      return alert("❌ Error: Billetera no conectada");
    setCargando(true);
    try {
      const res = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: user.wallet.address,
          pueblo: puebloId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await publicClient.waitForTransactionReceipt({ hash: data.txHash });
        audioSello.current?.play().catch(() => {}); // Catch por si el navegador bloquea audio
        await leerPasaporte();
        alert(`🎉 ¡Sello de ${puebloId} capturado!`);
      }
    } catch (e) {
      console.error("❌ Error:", e);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-5 pb-24">
      <div className="relative h-72 w-full overflow-hidden rounded-[40px] border-4 border-card shadow-2xl z-0">
        <MapaReal />
      </div>

      <div className="bg-card border border-primary/10 rounded-3xl p-5 shadow-sm -mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-foreground">
            Pasaporte Digital
          </h2>
          <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full uppercase">
            {cantidadSellos} Sellos
          </span>
        </div>

        {authenticated && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => mintear("sombrillas_guatape")}
              disabled={cargando}
              className={`py-3 rounded-2xl font-bold text-[10px] uppercase transition-all ${cargando ? "bg-muted text-muted-foreground" : "bg-primary text-white active:scale-95 shadow-lg shadow-primary/20"}`}
            >
              {cargando ? "Minteando..." : "📸 Sombrillas"}
            </button>

            <button
              onClick={() => mintear("guatape_socalos")}
              disabled={cargando}
              className={`py-3 rounded-2xl font-bold text-[10px] uppercase transition-all ${cargando ? "bg-muted text-muted-foreground" : "bg-orange-600 text-white active:scale-95 shadow-lg shadow-orange-600/20"}`}
            >
              {cargando ? "..." : "🏛️ Zócalos"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
          Colección de Recuerdos
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {sellos.length === 0 && !cargando && (
            <p className="col-span-2 text-center text-muted-foreground text-xs italic py-10">
              Tu pasaporte está vacío. ¡Escanea un QR o usa el mapa!
            </p>
          )}
          {sellos.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-primary/10 rounded-3xl overflow-hidden shadow-md"
            >
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <p className="text-[10px] font-black uppercase truncate text-primary">
                  {s.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
