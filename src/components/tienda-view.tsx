"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther, getAddress } from "viem";
import { celo } from "viem/chains";
import { useTheme } from "@/lib/theme-context";
import { Loader2, CheckCircle } from "lucide-react";

const NFT_PRODUCTS = [
  {
    id: 1,
    name: "Guatapé",
    price: "0.05",
    puebloId: "guatape_socalos",
    img: "/images/community-1.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
  },
  {
    id: 2,
    name: "Sombrillas",
    price: "0.05",
    puebloId: "sombrillas_guatape",
    img: "/images/community-2.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
  },
  {
    id: 3,
    name: "Jardín",
    price: "0.08",
    puebloId: "jardin_cafe",
    img: "/images/product-manilla.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
  },
  {
    id: 4,
    name: "Envigado",
    price: "0.05",
    puebloId: "envigado_verde",
    img: "/images/product-sombrero.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
  },
  {
    id: 5,
    name: "Jericó",
    price: "0.1",
    puebloId: "jerico_cuero",
    img: "/images/product-mochila.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
  },
  {
    id: 6,
    name: "Mompox",
    price: "0.12",
    puebloId: "mompox_filigrana",
    img: "/images/stamp-guatape.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
  },
];

export function TiendaView() {
  const { user, authenticated, login } = usePrivy();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { isDarkMode } = useTheme();

  const [paying, setPaying] = useState<number | null>(null);
  const [paid, setPaid] = useState<Set<number>>(new Set());

  async function handlePay(product: (typeof NFT_PRODUCTS)[0]) {
    if (!authenticated) return login();
    setPaying(product.id);

    try {
      // Forzar cambio a Mainnet si es necesario
      try {
        await switchChainAsync({ chainId: celo.id });
      } catch (e) {
        console.log("Ya en Celo Mainnet o usuario canceló switch");
      }

      // Ejecutar transferencia real de CELO
      const tx = await sendTransactionAsync({
        to: getAddress(product.wallet),
        value: parseEther(product.price),
      });

      console.log("Transacción exitosa:", tx);

      // Llamada al backend para mintear el NFT en el nuevo contrato de Mainnet
      const res = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: user?.wallet?.address,
          pueblo: product.puebloId,
        }),
      });

      if (res.ok) {
        setPaid((prev) => new Set(prev).add(product.id));
        alert(
          "¡Gracias por apoyar al artesano! Tu sello ya está en el pasaporte.",
        );
      }
    } catch (error: any) {
      console.error("Error en flujo de compra:", error);
      alert(
        error.shortMessage ||
          "La transacción falló. Asegúrate de tener saldo en CELO real y estar en Celo Mainnet.",
      );
    } finally {
      setPaying(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-24">
      <header className="pt-2 px-1 text-center">
        <h2 className="text-lg font-black uppercase tracking-tighter text-foreground italic">
          Mercado de Sellos
        </h2>
        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
          Celo Mainnet 🚀
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {NFT_PRODUCTS.map((nft) => (
          <div
            key={nft.id}
            className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all active:scale-95 ${
              isDarkMode
                ? "bg-card border-white/5 shadow-lg shadow-black/20"
                : "bg-white border-gray-100 shadow-sm"
            }`}
          >
            <div className="relative aspect-square w-full bg-muted">
              <img
                src={nft.img}
                alt={nft.name}
                className={`w-full h-full object-cover transition-all duration-500 ${paid.has(nft.id) ? "grayscale-0" : "grayscale-[0.6] opacity-80"}`}
              />
              {paid.has(nft.id) && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                  <CheckCircle className="text-white h-6 w-6 drop-shadow-md animate-in zoom-in" />
                </div>
              )}
            </div>

            <div className="p-2 flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase truncate text-foreground text-center">
                {nft.name}
              </span>
              <span className="text-[8px] font-mono text-primary font-bold text-center">
                {nft.price} CELO
              </span>

              <button
                onClick={() => handlePay(nft)}
                disabled={paying !== null || paid.has(nft.id)}
                className={`mt-1 w-full py-1.5 rounded-lg text-[8px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                  paid.has(nft.id)
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-primary text-white shadow-md active:bg-primary/80"
                }`}
              >
                {paying === nft.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : paid.has(nft.id) ? (
                  "Mío"
                ) : (
                  "Comprar"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 p-3 rounded-2xl bg-primary/5 border border-dashed border-primary/20 text-center">
        <p className="text-[9px] text-muted-foreground leading-relaxed">
          "El 100% de tu apoyo va directo a la billetera de los artesanos
          locales."
        </p>
      </div>
    </div>
  );
}
