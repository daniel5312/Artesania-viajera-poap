"use client";

import { useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { BADGE_CONTRACT } from "@/constants/contracts";
import { useTheme } from "@/lib/theme-context";
import { Loader2, ShieldCheck, ExternalLink, Box, Info } from "lucide-react";

const COLLECTIONS = [
  { id: 1, name: "Guatapé Zócalos", img: "/images/community-1.jpg", description: "Sello de autenticidad de la comunidad de Guatapé, Antioquia." },
  { id: 2, name: "Sombrillas Guatapé", img: "/images/community-2.jpg", description: "Insignia de la calle de las sombrillas en Guatapé." },
  { id: 3, name: "Jardín Café", img: "/images/product-manilla.jpg", description: "Artesanía inspirada en la cultura cafetera de Jardín." },
  { id: 4, name: "Envigado Verde", img: "/images/product-sombrero.jpg", description: "Sello de sostenibilidad y cultura de Envigado." },
  { id: 5, name: "Jericó Cuero", img: "/images/product-mochila.jpg", description: "Insignia de la tradición del cuero en Jericó." },
  { id: 6, name: "Mompox Filigrana", img: "/images/stamp-guatape.jpg", description: "Artesanía de filigrana momposina, patrimonio cultural." },
  { id: 7, name: "Cerámica El Carmen", img: "/images/community-1.jpg", description: "Sello de la tradición cerámica de El Carmen de Viboral." },
  { id: 8, name: "Mochila Biota", img: "/images/product-mochila.jpg", description: "Insignia de la colección Biota, moda sostenible." },
];

export function CollectionView() {
  const { address } = useAccount();
  const { isDarkMode, lang } = useTheme();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const badgeIds = [1, 2, 3, 4, 5, 6, 7, 8];

  const { data, isLoading } = useReadContracts({
    contracts: badgeIds.map((id) => ({
      ...BADGE_CONTRACT,
      functionName: "balanceOf",
      args: [address, BigInt(id)],
    })),
  });

  const myCollection = COLLECTIONS.filter((item, index) => {
    if (!data) return false;
    const balance = data[index]?.result;
    return balance && (balance as bigint) > 0n;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest opacity-50">
          {lang === "es" ? "Abriendo Bóveda..." : "Opening Vault..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-2 pb-24">
      <header className="pt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-2">
            <Box size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Digital Vault</span>
        </div>
        <h2 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          {lang === "es" ? "Mi Colección" : "My Collection"}
        </h2>
        <p className={`text-[10px] font-medium uppercase tracking-widest mt-1 opacity-50`}>
          {lang === "es" ? "Tus activos digitales en Celo" : "Your digital assets on Celo"}
        </p>
      </header>

      {myCollection.length === 0 ? (
        <div className={`p-8 rounded-[2.5rem] border border-dashed flex flex-col items-center justify-center text-center gap-4 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-300"}`}>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="text-primary/40" size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">
                {lang === "es" ? "Bóveda Vacía" : "Vault Empty"}
            </p>
            <p className="text-[10px] opacity-60 leading-relaxed max-w-[200px]">
                {lang === "es" ? "Aún no posees artesanías digitales. Explora la tienda para comenzar tu colección." : "You don't own digital crafts yet. Explore the shop to start your collection."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {myCollection.map((item) => (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-[2.5rem] overflow-hidden border transition-all ${isDarkMode ? "bg-black/40 border-white/10 hover:border-emerald-500/50 shadow-2xl" : "bg-white border-slate-200 shadow-xl"}`}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <button 
                    onClick={() => setSelectedItem(item)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                    <Info size={14} />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-[11px] font-black uppercase tracking-tight truncate">
                    {item.name}
                  </h3>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Authentic NFT
                  </p>
                </div>

                <a
                  href={`https://celoscan.io/token/${process.env.NEXT_PUBLIC_BADGE_ADDRESS}?a=${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${isDarkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                >
                  {lang === "es" ? "Ver en Celo" : "View On-Chain"} <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Metadatos */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-[3rem] border p-8 space-y-6 relative ${isDarkMode ? "bg-zinc-900 border-white/10" : "bg-white border-slate-200"}`}>
            <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src={selectedItem.img} className="w-full h-full object-cover" alt="" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight">{selectedItem.name}</h3>
                <p className="text-xs leading-relaxed opacity-70">{selectedItem.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Impact Generated</span>
                    <span className="text-[10px] font-black text-emerald-500">2% to GoodCollective</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Blockchain</span>
                    <span className="text-[10px] font-black">Celo Mainnet</span>
                </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {lang === "es" ? "Cerrar" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
