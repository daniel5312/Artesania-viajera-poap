"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, MapPin, Users, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import { t } from "@/lib/i18n";
import { useReadContract, useAccount } from "wagmi";
import { PASSPORT_CONTRACT } from "app/constants/contracts";

export function MomentosView() {
  const { isDarkMode, lang } = useTheme();
  const { address } = useAccount();
  const [liked, setLiked] = useState<Set<number>>(new Set());

  // 1. Leemos cuántos NFTs tiene el usuario
  const { data: balance } = useReadContract({
    ...PASSPORT_CONTRACT,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // 2. Aquí podrías mapear los URIs reales.
  // Por ahora, usemos el balance para validar la conexión.
  useEffect(() => {
    if (balance) {
      console.log("¡Tienes NFTs reales!", balance.toString());
    }
  }, [balance]);

  const cardClass = isDarkMode
    ? "border border-primary/10 shadow-[0_0_12px_rgba(129,98,243,0.06)] bg-card"
    : "shadow-md border-0 bg-card";

  return (
    <div className="flex flex-col gap-4 px-5 pb-24">
      {/* Indicador de Sincronización con Blockchain */}
      <div className="flex items-center justify-between bg-primary/10 p-3 rounded-2xl border border-primary/20">
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
          Estado Celo Sepolia
        </span>
        <span className="text-xs font-medium text-foreground">
          {balance
            ? `${balance.toString()} Momentos Encontrados`
            : "Buscando momentos..."}
        </span>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground">
          {t(lang, "momentos.title")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(lang, "momentos.subtitle")}
        </p>
      </div>

      {/* Aquí iría el mapeo de tus NFTs reales una vez obtengamos los URIs */}
      <div className="flex flex-col gap-4">
        {Number(balance) === 0 ? (
          <div className="text-center p-10 border-2 border-dashed border-muted rounded-3xl">
            <p className="text-xs text-muted-foreground">
              Aún no has inmortalizado momentos en este viaje.
            </p>
          </div>
        ) : (
          <p className="text-center text-[10px] text-accent font-bold">
            ¡Tu galería blockchain está lista!
          </p>
        )}
      </div>

      {/* Banner de Acción */}
      <div
        className={`rounded-3xl p-5 text-center ${isDarkMode ? "border border-primary/30 bg-primary/5" : "bg-primary/5 shadow-md"}`}
      >
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          {t(lang, "momentos.ctaTitle")}
        </h3>
        <button className="mt-3 w-full rounded-2xl bg-linear-to-r from-teal to-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg transition-all active:scale-[0.98]">
          {t(lang, "momentos.goToShop")}
        </button>
      </div>
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
