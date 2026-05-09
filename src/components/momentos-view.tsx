"use client";
import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Loader2,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  X,
  Heart,
  MessageCircle,
  MapPin,
  Users,
  ShoppingBag,
} from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { celo } from "viem/chains";
import { stringToHex, pad, createPublicClient, http } from "viem";
import imageCompression from "browser-image-compression";
import { REGISTRY_CONTRACT } from "@/constants/contracts";
import { ImageModal } from "./image-modal";
import { useTheme } from "@/lib/theme-context";
import { t } from "@/lib/i18n";

import { usePrivy } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

// Siempre usar el gateway dedicado, nunca el público (lento)
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || "amethyst-junior-muskox-299.mypinata.cloud";
function ipfsToUrl(cid: string): string {
  if (!cid) return "";
  if (cid.startsWith("http")) return cid;
  return `https://${IPFS_GATEWAY}/ipfs/${cid.replace("ipfs://", "")}`;
}

const PUEBLOS = [
  { id: "guatape_socalos", nombre: "Zócalos (Guatapé)" },
  { id: "sombrillas_guatape", nombre: "Sombrillas (Guatapé)" },
  { id: "jardin_cafe", nombre: "Manilla (Jardín)" },
  { id: "envigado_verde", nombre: "Artesanía (Envigado)" },
  { id: "jerico_cuero", nombre: "Carriel (Jericó)" },
  { id: "mompox_filigrana", nombre: "Filigrana (Mompox)" },
  { id: "el_carmen_ceramica", nombre: "Cerámica (El Carmen)" },
  { id: "biota_line", nombre: "Biota Line" }
];

const PUEBLOS_IDS = PUEBLOS.map((p) => p.id);

export function MomentosView({
  selectedSello,
  onNavigate,
}: {
  selectedSello: any;
  onNavigate?: (t: any) => void;
}) {
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");

  const address = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [fotosLocales, setFotosLocales] = useState<string[]>([]);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. LECTURA (Corregida: El contrato exige bytes32)
  const { data: muralData } = useReadContract({
    address: REGISTRY_CONTRACT.address,
    abi: REGISTRY_CONTRACT.abi,
    functionName: "obtenerMural",
    // 🟢 FIX: Convertimos el string (ej. "guatape_socalos") al formato exacto de la blockchain
    args: selectedSello?.puebloId
      ? [pad(stringToHex(selectedSello.puebloId), { size: 32 })]
      : [pad(stringToHex(""), { size: 32 })],
    query: { enabled: !!selectedSello },
  });

  // 2. FILTRO DE FOTOS HISTÓRICAS
  const fotosHistoricas = ((muralData as any[]) || [])
    .filter((item) => {
      if (!item || !item.autor) return false;
      // 🟢 FIX: toLowerCase previene errores si la wallet tiene mayúsculas intercaladas
      return address && item.autor.toLowerCase() === address.toLowerCase();
    })
    .map((item) => {
      const cid = item.cid;
      if (!cid) return "";
      return ipfsToUrl(cid);
    })
    .filter((url) => url !== "");

  const todasLasFotos = [...fotosLocales, ...fotosHistoricas];

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: "image/jpeg" });
  };

  // 3. LÓGICA DEL ROBOT (FETCH)
  const handleGuardarMomento = async () => {
    if (!address) return alert("🚨 Billetera no conectada.");
    if (!fotoPreview) return alert("📸 Selecciona una foto.");

    setProcesando(true);

    try {
      // A. COMPRESIÓN
      const imageFile = base64ToFile(fotoPreview, "momento.jpg");
      const compressedFile = await imageCompression(imageFile, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
      });

      // B. SUBIR A PINATA
      const formData = new FormData();
      formData.append("file", compressedFile);
      const resUpload = await fetch("/api/upload-moment", {
        method: "POST",
        body: formData,
      });
      const dataUpload = await resUpload.json();
      if (!dataUpload.success) throw new Error(dataUpload.error);

      // C. REGISTRO AUTOMÁTICO
      const resRegister = await fetch("/api/register-moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: address,
          puebloId: selectedSello.puebloId,
          cid: dataUpload.ipfsUrl,
        }),
      });

      const dataRegister = await resRegister.json();
      if (!dataRegister.success) throw new Error(dataRegister.error);

      setIsConfirmed(true);
    } catch (error: any) {
      alert(error.message || "Error técnico");
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrarModal = () => {
    if (isConfirmed && fotoPreview) {
      setFotosLocales((prev) => [fotoPreview, ...prev]);
    }
    setIsModalOpen(false);
    setTimeout(() => {
      setFotoPreview(null);
      setIsConfirmed(false);
      setProcesando(false);
    }, 500);
  };

  const isWorking = procesando;

  if (!selectedSello) return <MomentosFeed />;

  return (
    <div className="flex flex-col gap-6 relative pb-36">
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />

      {/* 1. SELLO GIGANTE */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <div
          className="relative cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setImagenAmpliada(selectedSello.image)}
        >
          <div className="absolute -inset-6 bg-linear-to-tr from-primary/30 to-teal-500/30 rounded-[3rem] blur-3xl animate-pulse" />
          <img
            src={selectedSello.image}
            className="relative w-44 h-44 rounded-3xl object-cover border-[6px] border-card shadow-2xl"
            alt={selectedSello.name}
          />
        </div>
        <h2 className="text-3xl font-black text-foreground mt-6 text-center tracking-tighter">
          {selectedSello.name}
        </h2>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
          Sello Digital Verificado
        </p>
      </div>

      {/* 2. ÁLBUM */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <ImageIcon size={20} className="text-teal-500" />
            Álbum
          </h3>
          <span className="text-xs font-bold text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
            {todasLasFotos.length} Fotos
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              setIsConfirmed(false);
              setIsModalOpen(true);
            }}
            className="aspect-square flex flex-col items-center justify-center bg-primary/10 rounded-2xl border-2 border-dashed border-primary/40"
          >
            <Camera className="text-primary mb-1" size={24} />
            <span className="text-[8px] font-black uppercase text-primary">
              Subir Foto
            </span>
          </button>
          {todasLasFotos.map((foto, idx) => (
            <div
              key={idx}
              onClick={() => setImagenAmpliada(foto)}
              className="aspect-square rounded-2xl overflow-hidden border border-primary/20 cursor-pointer"
            >
              <img
                src={foto}
                className="w-full h-full object-cover"
                alt="Momento"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL DE CÁMARA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md px-4 py-6">
          <div className="w-full max-w-sm bg-card/90 rounded-[2.5rem] shadow-2xl border border-primary/20 flex flex-col max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 sticky top-0 bg-card/80 backdrop-blur-md z-10">
              <h3 className="font-black text-primary text-sm uppercase">
                Nuevo Momento
              </h3>
              {!isWorking && (
                <button
                  onClick={handleCerrarModal}
                  className="p-2 bg-primary/10 rounded-full text-primary"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="p-5 flex flex-col gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      setFotoPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              <div
                onClick={() =>
                  !isWorking && !isConfirmed && fileInputRef.current?.click()
                }
                className={`relative aspect-square w-full rounded-3xl overflow-hidden flex items-center justify-center ${!fotoPreview ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""}`}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="text-primary/50 flex flex-col items-center">
                    <Camera size={48} />
                    <span className="text-[10px] font-black uppercase mt-2">
                      Toca para la cámara
                    </span>
                  </div>
                )}
                {isWorking && (
                  <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center">
                    <Loader2
                      className="animate-spin text-primary mb-2"
                      size={32}
                    />
                    <span className="text-xs font-bold text-primary">
                      Subiendo a la Blockchain...
                    </span>
                  </div>
                )}
              </div>

              {!isConfirmed ? (
                <button
                  onClick={handleGuardarMomento}
                  disabled={!fotoPreview || isWorking}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex justify-center gap-2 items-center"
                >
                  {isWorking ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "🚀 Guardar Momento"
                  )}
                </button>
              ) : (
                <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-2xl text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                      ¡Momento Inmortalizado!
                    </p>
                  </div>
                  <button
                    onClick={handleCerrarModal}
                    className="w-full bg-card border border-primary/20 text-primary py-4 rounded-2xl font-black text-xs uppercase shadow-md flex justify-center items-center active:scale-95 transition-all"
                  >
                    Cerrar y ver Álbum
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MomentosFeed() {
  const { lang, isDarkMode } = useTheme();
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");
  const address = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const [momentosGlobales, setMomentosGlobales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState(PUEBLOS[0].id);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  // Estados del modal de cámara
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [fotosLocales, setFotosLocales] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const leerMuralGlobal = async () => {
    if (!address) return;
    setCargando(true);
    try {
      let todos: any[] = [];

      const promesas = PUEBLOS_IDS.map(async (id) => {
        try {
          const puebloIdBytes = pad(stringToHex(id), { size: 32 });
          const mural = (await publicClient.readContract({
            ...REGISTRY_CONTRACT,
            functionName: "obtenerMural",
            args: [puebloIdBytes],
          })) as any[];

          if (mural) {
            const misFotos = mural.filter((m: any) => m.autor.toLowerCase() === address.toLowerCase());
            return misFotos.map((m: any) => ({
              url: ipfsToUrl(m.cid),
              pueblo: id,
              autor: m.autor,
              fecha: Number(m.fecha),
            }));
          }
        } catch (e) {
          console.error(`Error leyendo ${id}:`, e);
        }
        return [];
      });

      const resultados = await Promise.all(promesas);
      todos = resultados.flat();
      setMomentosGlobales(todos.sort((a, b) => b.fecha - a.fecha));
    } catch (e) {
      console.error("Error global:", e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    leerMuralGlobal();
  }, [address]);

  const fotosFiltradas = momentosGlobales.filter((m) => m.pueblo === filtroActivo);
  const todasEnPueblo = [...fotosLocales.map(url => ({ url, pueblo: filtroActivo })), ...fotosFiltradas];

  const handleGuardarMomento = async () => {
    if (!address) return alert("Billetera no conectada.");
    if (!fotoPreview) return alert("Selecciona una foto.");
    setProcesando(true);
    try {
      const imageFile = await fetch(fotoPreview).then(r => r.blob()).then(b => new File([b], "momento.jpg", { type: "image/jpeg" }));
      const { default: imageCompression } = await import("browser-image-compression");
      const compressed = await imageCompression(imageFile, { maxSizeMB: 0.8, maxWidthOrHeight: 1200 });
      const formData = new FormData();
      formData.append("file", compressed);
      const resUpload = await fetch("/api/upload-moment", { method: "POST", body: formData });
      const dataUpload = await resUpload.json();
      if (!dataUpload.success) throw new Error(dataUpload.error);
      const resRegister = await fetch("/api/register-moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: address, puebloId: filtroActivo, cid: dataUpload.ipfsUrl }),
      });
      const dataRegister = await resRegister.json();
      if (!dataRegister.success) throw new Error(dataRegister.error);
      setIsConfirmed(true);
    } catch (e: any) {
      alert(e.message || "Error técnico");
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrarModal = () => {
    if (isConfirmed && fotoPreview) setFotosLocales(prev => [fotoPreview, ...prev]);
    setIsModalOpen(false);
    setTimeout(() => { setFotoPreview(null); setIsConfirmed(false); setProcesando(false); }, 500);
  };

  return (
    <div className="flex flex-col gap-5 px-4 pb-24 relative">
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />

      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="text-primary" size={18} /> Mi Álbum
          </h2>
          <p className="mt-0.5 text-[10px] font-bold text-muted-foreground uppercase">
            Tus recuerdos físicos y digitales
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PUEBLOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setFiltroActivo(p.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filtroActivo === p.id ? "bg-primary text-white shadow-md" : "bg-card/40 border border-primary/10 text-muted-foreground"}`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-2">
        {/* Botón cámara siempre visible como primer elemento */}
        <button
          onClick={() => { setIsConfirmed(false); setFotoPreview(null); setIsModalOpen(true); }}
          className="aspect-square flex flex-col items-center justify-center bg-primary/10 rounded-2xl border-2 border-dashed border-primary/40 active:scale-95 transition-all"
        >
          <Camera className="text-primary mb-1" size={24} />
          <span className="text-[8px] font-black uppercase text-primary">Subir Foto</span>
        </button>

        {cargando ? (
          <div className="col-span-2 flex justify-center items-center py-4">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : todasEnPueblo.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-4 text-center">
            <MapPin className="text-primary/30 mb-1" size={22} />
            <p className="text-[9px] font-bold text-muted-foreground uppercase">Aún no tienes fotos aquí</p>
          </div>
        ) : (
          todasEnPueblo.map((m, i) => (
            <div
              key={i}
              onClick={() => setImagenAmpliada(m.url)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-primary/10 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <img src={m.url} className="w-full h-full object-cover" alt="Mi Momento" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
            </div>
          ))
        )}
      </div>

      {/* Modal de cámara */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md px-4 py-6">
          <div className="w-full max-w-sm bg-card/90 rounded-[2.5rem] shadow-2xl border border-primary/20 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 sticky top-0 bg-card/80 backdrop-blur-md z-10">
              <h3 className="font-black text-primary text-sm uppercase">Nuevo Momento — {PUEBLOS.find(p => p.id === filtroActivo)?.nombre}</h3>
              {!procesando && <button onClick={handleCerrarModal} className="p-2 bg-primary/10 rounded-full text-primary"><X size={18} /></button>}
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div
                onClick={() => !procesando && !isConfirmed && fileInputRef.current?.click()}
                className={`relative aspect-square w-full rounded-3xl overflow-hidden flex items-center justify-center ${!fotoPreview ? "bg-primary/5 border-2 border-dashed border-primary/30" : ""}`}
              >
                {fotoPreview ? (
                  <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-primary/50 flex flex-col items-center">
                    <Camera size={48} />
                    <span className="text-[10px] font-black uppercase mt-2">Toca para la cámara</span>
                  </div>
                )}
                {procesando && (
                  <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-primary mb-2" size={32} />
                    <span className="text-xs font-bold text-primary">Subiendo a la Blockchain...</span>
                  </div>
                )}
              </div>
              {!isConfirmed ? (
                <button
                  onClick={handleGuardarMomento}
                  disabled={!fotoPreview || procesando}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex justify-center gap-2 items-center disabled:opacity-50"
                >
                  {procesando ? <Loader2 className="animate-spin" size={18} /> : "Guardar Momento"}
                </button>
              ) : (
                <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-2xl text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">¡Momento Inmortalizado!</p>
                  </div>
                  <button onClick={handleCerrarModal} className="w-full bg-card border border-primary/20 text-primary py-4 rounded-2xl font-black text-xs uppercase">
                    Cerrar y ver Álbum
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`rounded-3xl p-5 text-center mt-4 ${
          isDarkMode
            ? "border border-primary/30 bg-primary/5"
            : "bg-primary/5 shadow-md"
        }`}
      >
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Apoya a más artesanos</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Cada sello que coleccionas es una historia que ayudas a preservar.
        </p>
      </div>
    </div>
  );
}
