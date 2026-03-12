"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Users } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { REGISTRY_CONTRACT } from "@/constants/contracts";
import { ImageModal } from "./image-modal"; // 🟢 Importamos el visualizador

const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

const PUEBLOS = [
  { id: "todos", nombre: "🌍 Todos" },
  { id: "guatape_socalos", nombre: "Zócalos (Guatapé)" },
  { id: "sombrillas_guatape", nombre: "Sombrillas (Guatapé)" },
  { id: "jardin_cafe", nombre: "Manilla (Jardín)" },
  { id: "envigado_verde", nombre: "Artesanía (Envigado)" },
  { id: "jerico_cuero", nombre: "Carriel (Jericó)" },
];

const PUEBLOS_IDS = PUEBLOS.filter((p) => p.id !== "todos").map((p) => p.id);

export function ComunidadView() {
  const { lang } = useTheme();
  const [momentosGlobales, setMomentosGlobales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("todos");

  // 🟢 ESTADO PARA VER LA FOTO EN GRANDE
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const leerMuralGlobal = useCallback(async () => {
    setCargando(true);
    try {
      let todos: any[] = [];
      const gateway =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

      for (const id of PUEBLOS_IDS) {
        try {
          const mural = (await publicClient.readContract({
            ...REGISTRY_CONTRACT,
            functionName: "obtenerMural",
            args: [id],
          })) as any[];

          if (mural) {
            todos.push(
              ...mural.map((m) => {
                let urlLimpia = m.cid;
                if (urlLimpia.startsWith("ipfs://")) {
                  urlLimpia = urlLimpia.replace(
                    "ipfs://",
                    `https://${gateway}/ipfs/`,
                  );
                } else if (!urlLimpia.startsWith("http")) {
                  urlLimpia = `https://${gateway}/ipfs/${urlLimpia}`;
                }
                return { url: urlLimpia, pueblo: id, autor: m.autor };
              }),
            );
          }
        } catch (e) {
          console.error(`Error leyendo pueblo ${id}:`, e);
        }
      }
      setMomentosGlobales(todos.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    leerMuralGlobal();
  }, [leerMuralGlobal]);

  const fotosFiltradas =
    filtroActivo === "todos"
      ? momentosGlobales
      : momentosGlobales.filter((m) => m.pueblo === filtroActivo);

  return (
    <div className="flex flex-col gap-5 px-4 pb-24 relative">
      {/* 🟢 VISUALIZADOR A PANTALLA COMPLETA */}
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />

      {/* Cabecera */}
      <div className="flex items-center justify-between bg-linear-to-r from-accent/20 to-primary/10 p-4 rounded-3xl border border-white/10 shadow-sm backdrop-blur-md">
        <span className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest">
          <Users size={16} className="text-accent" /> Red Phygital
        </span>
        <span className="text-xs font-bold text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
          {cargando ? (
            <Loader2 className="w-3 h-3 animate-spin text-accent" />
          ) : (
            `${momentosGlobales.length} Fotos`
          )}
        </span>
      </div>

      {/* Menú Scroll Horizontal */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x">
        {PUEBLOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setFiltroActivo(p.id)}
            className={`shrink-0 snap-center px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              filtroActivo === p.id
                ? "bg-linear-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(129,98,243,0.4)] scale-105 border-transparent"
                : "bg-card/40 backdrop-blur-md border border-primary/20 text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {/* Galería de Fotos */}
      <div className="flex flex-col gap-4">
        {cargando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-accent w-8 h-8" />
          </div>
        ) : fotosFiltradas.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed border-primary/20 rounded-3xl bg-card/30">
            <p className="text-xs text-muted-foreground">
              Sé el primero en presumir tu artesanía aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {fotosFiltradas.map((m, i) => (
              <div
                key={i}
                // 🟢 Al hacer click, guardamos la URL en el estado para abrir el modal
                onClick={() => setImagenAmpliada(m.url)}
                className="relative aspect-square rounded-xl overflow-hidden bg-card border border-primary/20 shadow-sm active:scale-95 transition-transform cursor-pointer group"
              >
                <img
                  src={m.url}
                  className="w-full h-full object-cover"
                  alt="Momento global"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-2 pt-6">
                  <p className="text-[7px] font-mono text-white/90 truncate text-center">
                    {m.autor.slice(0, 4)}...{m.autor.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
