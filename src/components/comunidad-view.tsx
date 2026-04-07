"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Users, MapPin } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { createPublicClient, http, stringToHex, pad } from "viem"; // 🟢 1. Importar conversores de Viem
import { celo } from "viem/chains";
import { REGISTRY_CONTRACT } from "@/constants/contracts";
import { ImageModal } from "./image-modal";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

// 🟢 2. Bajé la fecha un par de días para que veas tus pruebas recientes
const LANZAMIENTO_TIMESTAMP = 1774656000; // 28 Mar 2026

const PUEBLOS = [
  { id: "todos", nombre: "🌍 Todos" },
  { id: "guatape_socalos", nombre: "Zócalos (Guatapé)" },
  { id: "sombrillas_guatape", nombre: "Sombrillas (Guatapé)" },
  { id: "jardin_cafe", nombre: "Manilla (Jardín)" },
  { id: "envigado_verde", nombre: "Artesanía (Envigado)" },
  { id: "jerico_cuero", nombre: "Carriel (Jericó)" },
];

const PUEBLOS_IDS = PUEBLOS.filter((p) => p.id !== "todos").map((p) => p.id);

export function ComunidadView({
  initialPuebloId = "todos",
}: {
  initialPuebloId?: string;
}) {
  const { lang } = useTheme();
  const [momentosGlobales, setMomentosGlobales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState(initialPuebloId);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const leerMuralGlobal = useCallback(async () => {
    setCargando(true);
    try {
      let todos: any[] = [];
      const gateway =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

      for (const id of PUEBLOS_IDS) {
        try {
          // 🟢 3. Convertir el id a bytes32 antes de llamar al contrato
          const puebloIdBytes = pad(stringToHex(id), { size: 32 });

          const mural = (await publicClient.readContract({
            ...REGISTRY_CONTRACT,
            functionName: "obtenerMural",
            args: [puebloIdBytes], // 🟢 4. Mandamos el ID convertido
          })) as any[];

          if (mural) {
            todos.push(
              ...mural.map((m) => ({
                url: m.cid.startsWith("ipfs://")
                  ? m.cid.replace("ipfs://", `https://${gateway}/ipfs/`)
                  : m.cid.startsWith("http")
                    ? m.cid
                    : `https://${gateway}/ipfs/${m.cid}`,
                pueblo: id,
                autor: m.autor,
                fecha: Number(m.fecha),
              })),
            );
          }
        } catch (e) {
          console.error(`Error leyendo ${id}:`, e);
        }
      }
      setMomentosGlobales(todos.sort((a, b) => b.fecha - a.fecha));
    } catch (e) {
      console.error("Error global:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    leerMuralGlobal();
  }, [leerMuralGlobal]);

  const fotosFiltradas = (() => {
    const base = momentosGlobales.filter(
      (m) =>
        m.fecha >= LANZAMIENTO_TIMESTAMP &&
        (filtroActivo === "todos" || m.pueblo === filtroActivo),
    );
    // 🟢 5. QUITÉ EL MAP DE ÚNICOS: Así se ven todas las fotos de todos los usuarios
    return base.slice(0, 12);
  })();

  return (
    <div className="flex flex-col gap-5 px-4 pb-24 relative">
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />
      <div className="flex items-center justify-between bg-card/40 p-4 rounded-3xl border border-primary/20 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
            <Users size={14} /> Red Phygital
          </span>
          <span className="text-[9px] text-muted-foreground font-bold">
            {filtroActivo === "todos"
              ? "Global"
              : PUEBLOS.find((p) => p.id === filtroActivo)?.nombre}
          </span>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-full">
          {cargando ? (
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
          ) : (
            <span className="text-[10px] font-black text-primary">
              {fotosFiltradas.length}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {PUEBLOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setFiltroActivo(p.id)}
            className={`shrink-0 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all ${filtroActivo === p.id ? "bg-primary text-white shadow-lg scale-105" : "bg-card/40 border border-primary/10 text-muted-foreground"}`}
          >
            {p.nombre}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cargando ? (
          <div className="col-span-3 flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : fotosFiltradas.length === 0 ? (
          <div className="col-span-3 text-center p-12 border-2 border-dashed border-primary/10 rounded-2xl bg-primary/5">
            <MapPin className="mx-auto mb-3 text-primary/30" size={32} />
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Aún no hay momentos
            </p>
          </div>
        ) : (
          fotosFiltradas.map((m, i) => (
            <div
              key={i}
              onClick={() => setImagenAmpliada(m.url)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-primary/10 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <img
                src={m.url}
                className="w-full h-full object-cover"
                alt="Comunidad"
              />
              <div className="absolute bottom-2 left-0 right-0 px-2 text-center bg-black/40 backdrop-blur-sm mx-1 rounded-lg">
                <p className="text-[6px] font-mono text-white truncate uppercase">
                  {m.autor.slice(0, 4)}...{m.autor.slice(-4)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
