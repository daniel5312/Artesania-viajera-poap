"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { PASSPORT_CONTRACT } from "@/constants/contracts";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Stamp,
  QrCode,
} from "lucide-react";

const MapaReal = dynamic(() => import("@/components/mapa"), { ssr: false });
const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const PUEBLOS_DEMO = [
  { id: "guatape_socalos", name: "Guatapé" },
  { id: "sombrillas_guatape", name: "Sombrillas" },
];

export function PasaporteView({
  onStampClick,
}: {
  onStampClick: (sello: any) => void;
}) {
  const { user, authenticated, login } = usePrivy();
  const [sellos, setSellos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [simulando, setSimulando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 15;

  const leerPasaporte = useCallback(async () => {
    const walletAddress = user?.wallet?.address;
    if (!authenticated || !walletAddress) return;
    setCargando(true);
    try {
      const ids = Array.from({ length: 100 }, (_, i) => BigInt(i));
      const owners = await publicClient.multicall({
        contracts: ids.map((id) => ({
          ...PASSPORT_CONTRACT,
          functionName: "ownerOf",
          args: [id],
        })),
        allowFailure: true,
      });

      const misIds = ids.filter(
        (_, i) =>
          owners[i].status === "success" &&
          (owners[i].result as string).toLowerCase() ===
            walletAddress.toLowerCase(),
      );

      const uris = await publicClient.multicall({
        contracts: misIds.map((id) => ({
          ...PASSPORT_CONTRACT,
          functionName: "tokenURI",
          args: [id],
        })),
        allowFailure: true,
      });

      const gateway =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

      const nuevosSellos = (
        await Promise.all(
          uris.map(async (res, i) => {
            if (res.status !== "success") return null;
            try {
              const url = (res.result as string).replace(
                "ipfs://",
                `https://${gateway}/ipfs/`,
              );
              const response = await fetch(url);
              if (!response.ok) return null;

              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("image")) {
                return {
                  id: misIds[i].toString(),
                  puebloId: "guatape_socalos",
                  name: `Sello #${misIds[i].toString()}`,
                  image: url,
                };
              }

              const meta = await response.json();
              return {
                ...meta,
                id: misIds[i].toString(),
                puebloId: meta.puebloId || "guatape_socalos",
                image: meta.image?.replace(
                  "ipfs://",
                  `https://${gateway}/ipfs/`,
                ),
              };
            } catch (e) {
              return null;
            }
          }),
        )
      ).filter(Boolean);

      setSellos(nuevosSellos.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [authenticated, user?.wallet?.address]);

  const handleSimularMint = async (puebloId: string) => {
    if (!authenticated) return login();
    setSimulando(puebloId);
    try {
      const res = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: user?.wallet?.address,
          pueblo: puebloId,
        }),
      });
      if (res.ok) {
        alert("¡Sello estampado con éxito!");
        leerPasaporte();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulando(null);
    }
  };

  useEffect(() => {
    leerPasaporte();
  }, [leerPasaporte]);

  const totalPaginas = Math.ceil(sellos.length / itemsPorPagina);
  const sellosMostrados = sellos.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina,
  );

  return (
    <div className="flex flex-col gap-6 px-1 relative">
      <div className="h-60 w-full overflow-hidden rounded-[40px] border-4 border-card shadow-2xl z-0">
        <MapaReal />
      </div>

      <div className="bg-primary/10 border border-dashed border-primary/30 rounded-[30px] p-4 flex flex-col gap-3">
        <p className="text-[9px] font-black uppercase text-center text-primary flex items-center justify-center gap-2">
          <QrCode size={12} /> Simular Escaneo en Pueblo
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PUEBLOS_DEMO.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSimularMint(p.id)}
              disabled={simulando !== null}
              className="text-[8px] bg-background border border-primary/20 px-3 py-1.5 rounded-full font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
            >
              {simulando === p.id ? "..." : p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-primary/10 p-3 rounded-2xl border border-primary/20">
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
            <Stamp size={14} /> Sellos Coleccionados
          </span>
          <span className="text-xs font-medium text-foreground">
            {cargando ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              `${sellos.length} NFTs`
            )}
          </span>
        </div>

        {cargando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : sellos.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-10">
            Tu pasaporte está vacío.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {sellosMostrados.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onStampClick(s)}
                  className="bg-card rounded-xl overflow-hidden shadow-sm active:scale-95 cursor-pointer border border-primary/20 relative aspect-square group"
                >
                  <img
                    src={s.image}
                    className="w-full h-full object-cover"
                    alt="Sello"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                    <p className="text-[7px] font-black uppercase text-white truncate text-center">
                      {s.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-2 bg-primary/10 rounded-full disabled:opacity-30 text-primary"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-bold text-muted-foreground">
                  Pág {paginaActual} / {totalPaginas}
                </span>
                <button
                  onClick={() =>
                    setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  className="p-2 bg-primary/10 rounded-full disabled:opacity-30 text-primary"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
