"use client";
import { useState } from "react";
import Checkout from "./checkout";

// Simulamos los 4 espacios (ID 0 es el Pasaporte, 1-3 son momentos)
const TOTAL_SPACES = [0, 1, 2, 3];

export default function MomentosGrid() {
  const [loading, setLoading] = useState<number | null>(null);

  // Estado local para simular que se subió una foto (En el siguiente paso conectaremos la IPFS/Contrato)
  const [nfts, setNfts] = useState<{ [key: number]: string }>({
    0: "https://purple-eligible-koala-155.mypinata.cloud/ipfs/QmZV3... (Tu Logo Pasaporte)",
  });

  const handleUploadMoment = (id: number) => {
    setLoading(id);
    // Aquí es donde llamaremos a la API de minteo que hicimos
    console.log("Minteando momento ID:", id);

    // Simulación de carga
    setTimeout(() => {
      setLoading(null);
      alert("¡Momento minteado con éxito! 🎉");
    }, 2000);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {TOTAL_SPACES.map((id) => (
        <div
          key={id}
          className={`relative aspect-square rounded-3xl border-2 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-4
            ${
              nfts[id]
                ? "border-[#8162f3] bg-zinc-900/50 shadow-[0_0_20px_rgba(129,98,243,0.2)]"
                : "border-zinc-800 bg-zinc-900/20 border-dashed hover:border-zinc-600"
            }`}
        >
          {nfts[id] ? (
            <>
              <div className="absolute top-2 right-2 bg-[#8162f3] p-1 rounded-full text-[10px] font-bold">
                ✓
              </div>
              <img
                src={nfts[id]}
                alt={`Momento ${id}`}
                className="w-full h-full object-cover rounded-2xl mb-2"
              />
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                {id === 0 ? "Pasaporte" : `Momento ${id}`}
              </span>
            </>
          ) : (
            <button
              onClick={() => handleUploadMoment(id)}
              disabled={loading !== null}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-2 group-hover:border-[#eb527d] group-hover:bg-[#eb527d]/10 transition-all
                ${loading === id ? "animate-spin border-t-transparent border-[#eb527d]" : ""}`}
              >
                <span className="text-2xl font-light text-zinc-500 group-hover:text-[#eb527d]">
                  {loading === id ? "" : "+"}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-600 group-hover:text-zinc-400">
                {loading === id ? "Subiendo..." : "Añadir Sello"}
              </span>
            </button>
          )}
        </div>
      ))}
      <Checkout />
    </div>
  );
}
