"use client";
import { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { celo } from "viem/chains";
import { stringToHex, pad } from "viem"; // 🟢 IMPORTANTE: Para convertir IDs a bytes32
import imageCompression from "browser-image-compression";
import { REGISTRY_CONTRACT } from "@/constants/contracts";
import { ImageModal } from "./image-modal";

export function MomentosView({
  selectedSello,
  onNavigate,
}: {
  selectedSello: any;
  onNavigate?: (t: any) => void;
}) {
  const { address } = useAccount();

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
      return cid.startsWith("http")
        ? cid
        : `https://gateway.pinata.cloud/ipfs/${cid.replace("ipfs://", "")}`;
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

  if (!selectedSello) return null;

  return (
    <div className="flex flex-col gap-6 relative pb-36">
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />

      {/* 1. SELLO GIGANTE */}
      <div className="flex flex-col items-center justify-center pt-6 pb-2">
        <div
          className="relative cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setImagenAmpliada(selectedSello.image)}
        >
          <div className="absolute -inset-4 bg-linear-to-tr from-purple-500/20 to-amber-500/20 rounded-[3rem] blur-2xl animate-pulse" />
          <img
            src={selectedSello.image}
            className="relative w-40 h-40 rounded-2rem object-cover border-4px border-card shadow-2xl"
            alt={selectedSello.name}
          />
        </div>
        <h2 className="text-3xl font-black text-foreground mt-6 text-center tracking-tighter">
          {selectedSello.name}
        </h2>
      </div>

      {/* 2. ÁLBUM */}
      <div className="px-2">
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
/*"use client";

import { useState, useRef } from "react";
import { Heart, MessageCircle, MapPin, Users, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import { t } from "@/lib/i18n";
import { useReadContract, useAccount } from "wagmi";
import { ARTESANIA_ABI } from "../contants/abis/ArtesaniaABI"; // Asegúrate de tener balanceOf y tokenURI en el ABI

const productFilters = [
  { id: "todos", labelKey: "momentos.all" },
  { id: "manilla", labelKey: "product.manilla.name" },
  { id: "mochila", labelKey: "product.mochila.name" },
  { id: "sombrero", labelKey: "product.sombrero.name" },
];

const moments = [
  {
    id: 1,
    buyerName: "Ana Castillo",
    buyerInitials: "AC",
    buyerColor: "bg-primary",
    productKey: "product.manilla.name",
    productId: "manilla",
    image: "/images/community-1.jpg",
    captionKey: "moment.1.caption",
    location: "Guatape, Antioquia",
    timeKey: "time.2h",
    likes: 24,
    comments: 5,
    circle: 47,
  },
  {
    id: 2,
    buyerName: "Carlos Mejia",
    buyerInitials: "CM",
    buyerColor: "bg-chart-5",
    productKey: "product.mochila.name",
    productId: "mochila",
    image: "/images/community-2.jpg",
    captionKey: "moment.2.caption",
    location: "Piedra del Penol",
    timeKey: "time.5h",
    likes: 57,
    comments: 12,
    circle: 31,
  },
  {
    id: 3,
    buyerName: "Lucia Rios",
    buyerInitials: "LR",
    buyerColor: "bg-chart-4",
    productKey: "product.manilla.name",
    productId: "manilla",
    image: "/images/community-3.jpg",
    captionKey: "moment.3.caption",
    location: "Mercado Guatape",
    timeKey: "time.1d",
    likes: 18,
    comments: 3,
    circle: 47,
  },
  {
    id: 4,
    buyerName: "Miguel Arenas",
    buyerInitials: "MA",
    buyerColor: "bg-accent",
    productKey: "product.sombrero.name",
    productId: "sombrero",
    image: "/images/community-4.jpg",
    captionKey: "moment.4.caption",
    location: "Embalse Guatape",
    timeKey: "time.2d",
    likes: 33,
    comments: 7,
    circle: 22,
  },
];

export function MomentosView() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, lang } = useTheme();
  const { address } = useAccount();
  const { data: balance } = useReadContract({
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`,
    abi: ARTESANIA_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  console.log("Total de momentos:", balance?.toString());

  const filtered =
    activeFilter === "todos"
      ? moments
      : moments.filter((m) => m.productId === activeFilter);

  function toggleLike(id: number) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const cardClass = isDarkMode
    ? "border border-primary/10 shadow-[0_0_12px_rgba(129,98,243,0.06)] bg-card"
    : "shadow-md border-0 bg-card";

  return (
    <div className="flex flex-col gap-4 px-5 pb-24">
      {/* Header *}
      <div>
        <h2 className="text-base font-semibold text-foreground">
          {t(lang, "momentos.title")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(lang, "momentos.subtitle")}
        </p>
      </div>

      {/* Product filter pills }
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {productFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all ${
              activeFilter === filter.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(lang, filter.labelKey)}
          </button>
        ))}
      </div>

      {/* Timeline feed }
      <div className="flex flex-col gap-4">
        {filtered.map((moment) => (
          <div
            key={moment.id}
            className={`overflow-hidden rounded-3xl ${cardClass}`}
          >
            {/* Buyer header }
            <div className="flex items-center gap-3 p-4 pb-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${moment.buyerColor}`}
              >
                <span className="text-xs font-bold text-primary-foreground">
                  {moment.buyerInitials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {moment.buyerName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                    {t(lang, moment.productKey)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t(lang, moment.timeKey)}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo }
            <div className="relative h-52 w-full">
              <Image
                src={moment.image}
                alt={t(lang, moment.captionKey)}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-card/60 via-transparent to-transparent" />

              {/* Location tag }
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/60 px-2.5 py-1 backdrop-blur-sm">
                <MapPin className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-medium text-foreground">
                  {moment.location}
                </span>
              </div>
            </div>

            {/* Content }
            <div className="flex flex-col gap-3 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(lang, moment.captionKey)}
              </p>

              {/* Circle info + actions }
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(moment.id)}
                    className="flex items-center gap-1 transition-colors"
                    aria-label={liked.has(moment.id) ? "Unlike" : "Like"}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        liked.has(moment.id)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        liked.has(moment.id)
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {moment.likes + (liked.has(moment.id) ? 1 : 0)}
                    </span>
                  </button>
                  <button
                    className="flex items-center gap-1 text-muted-foreground"
                    aria-label="Comment"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{moment.comments}</span>
                  </button>
                </div>

                {/* Circle badge }
                <div className="flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1">
                  <Users className="h-3 w-3 text-teal" />
                  <span className="text-[10px] font-semibold text-teal">
                    {moment.circle + " " + t(lang, "momentos.connected")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner }
      <div
        className={`rounded-3xl p-5 text-center ${
          isDarkMode
            ? "border border-primary/30 bg-primary/5"
            : "bg-primary/5 shadow-md"
        }`}
      >
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          {t(lang, "momentos.ctaTitle")}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t(lang, "momentos.ctaBody")}
        </p>
        <button className="mt-3 rounded-2xl bg-linear-to-r from-teal to-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-teal/20 transition-all active:scale-[0.98]">
          {t(lang, "momentos.goToShop")}
        </button>
      </div>
    </div>
  );
}*/
