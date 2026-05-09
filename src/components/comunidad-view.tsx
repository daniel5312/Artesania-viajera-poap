"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Users, MapPin, Stamp } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { createPublicClient, http, stringToHex, pad } from "viem";
import { celo } from "viem/chains";
import { REGISTRY_CONTRACT, PASSPORT_CONTRACT } from "@/constants/contracts";
import { ImageModal } from "./image-modal";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

// Gateway dedicado de Pinata (siempre preferir sobre el público)
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || "amethyst-junior-muskox-299.mypinata.cloud";

function ipfsToUrl(cid: string): string {
  if (cid.startsWith("http")) return cid;
  const hash = cid.replace("ipfs://", "");
  return `https://${IPFS_GATEWAY}/ipfs/${hash}`;
}

// 📍 Traduce hash del tokenURI al puebloId — sincronizado con pasaporte-view.tsx
const URI_TO_PUEBLO: Record<string, string> = {
  // ✅ ACTIVOS
  "bafkreigqcbgkpmhml3zahydb7hq7gb373nhtjbssc4lko6su42l6tzrxf4": "guatape_socalos",
  "bafkreiegxd63qmcetnfhryf3x7uk63ayxnezqpx7nk6zup3532dzzfznu4": "sombrillas_guatape",
  // 🔜 ORIENTE ANTIOQUEÑO
  "QmPENDING_ElPenol":       "el_penol_piedra",
  "QmPENDING_Rionegro":      "rionegro_colonial",
  "QmPENDING_LaCeja":        "la_ceja_flores",
  "QmPENDING_CarmenViboral": "carmen_de_viboral_ceramica",
  "QmPENDING_ElRetiro":      "el_retiro_cuero",
  "QmPENDING_SanAntonioPer": "san_antonio_pereira",
  "QmPENDING_Marinilla":     "marinilla_patrimonio",
  "QmPENDING_Guarne":        "guarne_campesino",
  "QmPENDING_Santuario":     "santuario_refi",
  "QmPENDING_SanVicente":    "san_vicente_ferrer",
  // 🔜 ÁREA METROPOLITANA
  "QmPENDING_Envigado":      "envigado_arte",
  "QmPENDING_Medellin":      "medellin_centro",
  "QmPENDING_Sabaneta":      "sabaneta_artesanal",
  "QmPENDING_Caldas":        "caldas_tradicion",
  // 🔜 OCCIDENTE ANTIOQUEÑO
  "QmPENDING_SantaFe":       "santafe_de_antioquia",
};

const PUEBLOS = [
  // ✅ ACTIVOS
  { id: "guatape_socalos",           nombre: "Zócalos (Guatapé)" },
  { id: "sombrillas_guatape",         nombre: "Sombrillas (Guatapé)" },
  // 🔜 ORIENTE ANTIOQUEÑO
  { id: "el_penol_piedra",            nombre: "El Peñol" },
  { id: "rionegro_colonial",          nombre: "Rionegro" },
  { id: "la_ceja_flores",             nombre: "La Ceja" },
  { id: "carmen_de_viboral_ceramica", nombre: "Carmen de Viboral" },
  { id: "el_retiro_cuero",            nombre: "El Retiro" },
  { id: "san_antonio_pereira",        nombre: "San Antonio de Pereira" },
  { id: "marinilla_patrimonio",       nombre: "Marinilla" },
  { id: "guarne_campesino",           nombre: "Guarne" },
  { id: "santuario_refi",             nombre: "Santuario" },
  { id: "san_vicente_ferrer",         nombre: "San Vicente Ferrer" },
  // 🔜 ÁREA METROPOLITANA
  { id: "envigado_arte",              nombre: "Envigado" },
  { id: "medellin_centro",            nombre: "Medellín" },
  { id: "sabaneta_artesanal",         nombre: "Sabaneta" },
  { id: "caldas_tradicion",           nombre: "Caldas" },
  // 🔜 OCCIDENTE ANTIOQUEÑO
  { id: "santafe_de_antioquia",       nombre: "Santafé de Antioquia" },
];

const PUEBLOS_IDS = PUEBLOS.map((p) => p.id);

// Lee los pasaportes y construye un mapa { puebloId -> Set<walletAddress> }
async function buildStampHoldersMap(): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  PUEBLOS_IDS.forEach((id) => map.set(id, new Set()));

  try {
    const ids = Array.from({ length: 200 }, (_, i) => BigInt(i));

    const owners = await publicClient.multicall({
      contracts: ids.map((id) => ({
        ...PASSPORT_CONTRACT,
        address: PASSPORT_CONTRACT.address as `0x${string}`,
        functionName: "ownerOf",
        args: [id],
      })),
      allowFailure: true,
    });

    const validIndices = ids
      .map((id, i) => ({ id, i }))
      .filter(({ i }) => owners[i].status === "success");

    if (validIndices.length === 0) return map;

    const uris = await publicClient.multicall({
      contracts: validIndices.map(({ id }) => ({
        ...PASSPORT_CONTRACT,
        address: PASSPORT_CONTRACT.address as `0x${string}`,
        functionName: "tokenURI",
        args: [id],
      })),
      allowFailure: true,
    });

    uris.forEach((res, j) => {
      if (res.status !== "success") return;
      const uri = res.result as string;
      const hash = uri.split("/").pop() || "";
      const puebloId = URI_TO_PUEBLO[hash];
      const ownerResult = owners[validIndices[j].i];
      if (puebloId && ownerResult.status === "success") {
        const ownerAddr = (ownerResult.result as string).toLowerCase();
        map.get(puebloId)?.add(ownerAddr);
      }
    });
  } catch (e) {
    console.error("Error building stamp holders map:", e);
  }

  return map;
}

export function ComunidadView({
  initialPuebloId = "guatape_socalos",
}: {
  initialPuebloId?: string;
}) {
  const [momentosGlobales, setMomentosGlobales] = useState<any[]>([]);
  const [stampHolders, setStampHolders] = useState<Map<string, Set<string>>>(new Map());
  const [cargando, setCargando] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState(initialPuebloId);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

      // Cargar mapa de titulares + todos los murales en paralelo
      const [holdersMap, ...muralResults] = await Promise.all([
        buildStampHoldersMap(),
        ...PUEBLOS_IDS.map(async (id) => {
          try {
            const puebloIdBytes = pad(stringToHex(id), { size: 32 });
            const mural = (await publicClient.readContract({
              ...REGISTRY_CONTRACT,
              functionName: "obtenerMural",
              args: [puebloIdBytes],
            })) as any[];

            if (!mural) return [];
            return mural.map((m) => ({
              url: ipfsToUrl(m.cid),
              pueblo: id,
              autor: (m.autor as string).toLowerCase(),
              fecha: Number(m.fecha),
            }));
          } catch (e) {
            console.error(`Error leyendo mural ${id}:`, e);
            return [];
          }
        }),
      ]);

      setStampHolders(holdersMap);
      const todos = (muralResults as any[][]).flat();
      setMomentosGlobales(todos.sort((a, b) => b.fecha - a.fecha));
    } catch (e) {
      console.error("Error cargando comunidad:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtro clave: solo fotos de wallets que poseen el sello del pueblo activo
  const fotosFiltradas = momentosGlobales.filter((m) => {
    if (m.pueblo !== filtroActivo) return false;
    const holders = stampHolders.get(filtroActivo);
    // Fallback: si no hay holders cargados aún, mostramos todas
    if (!holders || holders.size === 0) return true;
    return holders.has(m.autor);
  });

  const holderCount = stampHolders.get(filtroActivo)?.size ?? 0;
  const puebloNombre = PUEBLOS.find((p) => p.id === filtroActivo)?.nombre ?? "";

  return (
    <div className="flex flex-col gap-5 px-4 pb-24 relative">
      <ImageModal src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />

      {/* Header con stats del pueblo */}
      <div className="flex items-center justify-between bg-card/40 p-4 rounded-3xl border border-primary/20 backdrop-blur-md">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
            <Users size={14} /> Comunidad Viajera
          </span>
          <span className="text-[9px] text-muted-foreground font-bold">
            {puebloNombre}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
            <Stamp size={10} className="text-primary" />
            <span className="text-[10px] font-black text-primary">
              {cargando ? "..." : `${holderCount} sellos`}
            </span>
          </div>
          <div className="bg-teal/10 px-3 py-1 rounded-full">
            {cargando ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              <span className="text-[10px] font-black text-teal">
                {fotosFiltradas.length} fotos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filtros de pueblo horizontal */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {PUEBLOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setFiltroActivo(p.id)}
            className={`shrink-0 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all ${
              filtroActivo === p.id
                ? "bg-primary text-white shadow-lg scale-105"
                : "bg-card/40 border border-primary/10 text-muted-foreground"
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {/* Grid de fotos verificadas */}
      <div className="grid grid-cols-3 gap-2">
        {cargando ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Verificando viajeros con sello...
            </p>
          </div>
        ) : fotosFiltradas.length === 0 ? (
          <div className="col-span-3 text-center p-12 border-2 border-dashed border-primary/10 rounded-2xl bg-primary/5">
            <Stamp className="mx-auto mb-3 text-primary/30" size={32} />
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Aún no hay momentos de viajeros con este sello
            </p>
            <p className="text-[9px] text-muted-foreground mt-1 opacity-70">
              Solo aparecen fotos de quienes tienen el sello verificado
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
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                alt="Comunidad"
              />
              {/* Badge viajero verificado */}
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-1">
                <Stamp size={8} className="text-primary/80 shrink-0" />
                <p className="text-[6px] font-mono text-white/80 truncate uppercase">
                  {m.autor.slice(0, 5)}…{m.autor.slice(-4)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
