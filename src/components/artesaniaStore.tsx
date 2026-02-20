"use client";
import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";

const PRODUCTS = [
  {
    id: 1,
    name: "Manilla Guatapé",
    priceTest: "0.01",
    priceReal: "0.0001",
    image: "https://placehold.co/400x400/8162f3/white?text=Manilla+Guatape",
    desc: "Edición especial del Peñol. Incluye NFT.",
  },
  {
    id: 2,
    name: "Collar Santa Fe",
    priceTest: "0.02",
    priceReal: "0.0001",
    image: "https://placehold.co/400x400/eb527d/white?text=Collar+SantaFe",
    desc: "Tejido a mano en Santa Fe de Antioquia.",
  },
  {
    id: 3,
    name: "Pulsera Cafetera",
    priceTest: "0.005",
    priceReal: "0.0001",
    image: "https://placehold.co/400x400/orange/white?text=Pulsera+Cafe",
    desc: "Hecha con granos reales y caña flecha.",
  },
];

const MERCHANT_WALLET = "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b";

export default function ArtesaniaStore() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [networkMode, setNetworkMode] = useState<"sepolia" | "mainnet">(
    "sepolia",
  );

  const handleBuy = async (product: any) => {
    if (!authenticated) return login();
    const wallet = wallets[0];
    if (!wallet) return alert("Primero conecta tu wallet.");

    setBuyingId(product.id);
    try {
      // 1. Forzar la red elegida
      const chainId = networkMode === "mainnet" ? 42220 : 11142220;
      await wallet.switchChain(chainId);

      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      // 2. Cobrar precio según red
      const price =
        networkMode === "mainnet" ? product.priceReal : product.priceTest;
      const tx = await signer.sendTransaction({
        to: MERCHANT_WALLET,
        value: ethers.parseEther(price),
      });
      await tx.wait();

      // 3. Mintear NFT
      const response = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: wallet.address, tipo: product.name }),
      });
      const data = await response.json();

      if (data.success)
        alert(`¡Compra exitosa! 🎉\nHash Pago: ${tx.hash.slice(0, 6)}...`);
      else alert("Pago recibido, pero error en NFT: " + data.error);
    } catch (error: any) {
      alert(
        "Error: " +
          (error?.info?.error?.message || error.message || "Fallo desconocido"),
      );
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-end">
        <select
          value={networkMode}
          onChange={(e) => setNetworkMode(e.target.value as any)}
          className="bg-zinc-900 border border-zinc-700 text-white rounded p-2"
        >
          <option value="sepolia">Modo Prueba (Sepolia)</option>
          <option value="mainnet">Modo Real (Celo Nativo)</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group"
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={prod.image}
                alt={prod.name}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-lg text-white">{prod.name}</h3>
              <p className="text-xs text-zinc-400">{prod.desc}</p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-purple-400 font-mono font-bold">
                  {networkMode === "mainnet" ? prod.priceReal : prod.priceTest}{" "}
                  CELO
                </span>
                <button
                  onClick={() => handleBuy(prod)}
                  disabled={buyingId !== null}
                  className="bg-white text-black px-4 py-2 rounded-lg text-xs font-black disabled:opacity-50"
                >
                  {buyingId === prod.id ? "Procesando..." : "Comprar"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
