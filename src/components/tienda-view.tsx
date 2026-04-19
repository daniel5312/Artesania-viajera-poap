"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract, // 🟢 NUEVO: Para interactuar con contratos de tokens ERC-20
} from "wagmi";
import { parseEther, getAddress, parseUnits } from "viem"; // 🟢 NUEVO: parseUnits para G$
import { celo } from "viem/chains";
import { useTheme } from "@/lib/theme-context";
import { Loader2, CheckCircle, Store, Map } from "lucide-react";
import { ImageModal } from "./image-modal";
import { REFI_SPLITTER_CONTRACT } from "@/constants/contracts";

// 🟢 NUEVO: Configuración de GoodDollar en Celo Mainnet
const G_DOLLAR_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;



const NFT_PRODUCTS = [
  {
    id: 1,
    name: "Guatapé",
    price: "0.05",
    puebloId: "guatape_socalos",
    img: "/images/community-1.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "sellos",
  },
  {
    id: 2,
    name: "Sombrillas",
    price: "0.05",
    puebloId: "sombrillas_guatape",
    img: "/images/community-2.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "sellos",
  },
  {
    id: 3,
    name: "Jardín",
    price: "0.08",
    puebloId: "jardin_cafe",
    img: "/images/product-manilla.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "artesanias",
  },
  {
    id: 4,
    name: "Envigado",
    price: "0.05",
    puebloId: "envigado_verde",
    img: "/images/product-sombrero.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "sellos",
  },
  {
    id: 5,
    name: "Jericó",
    price: "0.01",
    puebloId: "jerico_cuero",
    img: "/images/product-mochila.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "artesanias",
  },
  {
    id: 6,
    name: "Mompox",
    price: "0.02",
    puebloId: "mompox_filigrana",
    img: "/images/stamp-guatape.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "artesanias",
  },
  {
    id: 7,
    name: "Cerámica El Carmen",
    price: "0.05",
    puebloId: "el_carmen_ceramica",
    img: "/images/community-1.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "artesanias",
  },
  {
    id: 8,
    name: "Mochila Biota",
    price: "0.08",
    puebloId: "biota_line",
    img: "/images/product-mochila.jpg",
    wallet: "0x6D4763715bf9cDe401FD4AaC9a6254CeB4382c9b",
    type: "artesanias",
  },
];

export function TiendaView() {
  const { user, authenticated, login, getAccessToken } = usePrivy();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract(); // 🟢 NUEVO: Hook para GoodDollar
  const { switchChainAsync } = useSwitchChain();
  const { isDarkMode } = useTheme();

  const [category, setCategory] = useState<"artesanias" | "sellos">(
    "artesanias",
  );
  const [paying, setPaying] = useState<number | null>(null);
  const [paid, setPaid] = useState<Set<number>>(new Set());
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | undefined>();
  const [pendingProduct, setPendingProduct] = useState<{
    id: number;
    puebloId: string;
    recipient: string;
  } | null>(null);

  const {
    isLoading: isConfirmingPayment,
    isSuccess: isPaymentConfirmed,
    isError: isPaymentFailed,
  } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

  useEffect(() => {
    if (!isPaymentFailed) return;

    setPaying(null);
    setPaymentHash(undefined);
    setPendingProduct(null);
    alert("El pago no se confirmó en Celo. Inténtalo de nuevo.");
  }, [isPaymentFailed]);

  useEffect(() => {
    if (!isPaymentConfirmed || !pendingProduct) return;

    let cancelled = false;

    const mintPassport = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/mint-passport", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient: pendingProduct.recipient,
            puebloId: pendingProduct.puebloId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "No se pudo mintear el sello.");
        }

        if (cancelled) return;

        setPaid((prev) => new Set(prev).add(pendingProduct.id));
        // 🟢 CORRECCIÓN DE TEXTO: Ajustado para la experiencia de Tienda
        alert("¡Apoyo entregado al artesano! Tu NFT ha sido enviado.");
      } catch (error: any) {
        if (cancelled) return;
        alert(
          error.message || "El pago salió, pero el NFT no se pudo mintear.",
        );
      } finally {
        if (cancelled) return;

        setPaying(null);
        setPaymentHash(undefined);
        setPendingProduct(null);
      }
    };

    void mintPassport();

    return () => {
      cancelled = true;
    };
  }, [isPaymentConfirmed, pendingProduct]);

  // ✅ Pago nativo con CELO (Con el fix del chainId incluido)
  async function handlePayCelo(product: (typeof NFT_PRODUCTS)[0]) {
    if (!authenticated) return login();

    const recipient = user?.wallet?.address;
    if (!recipient) {
      alert("Conecta una wallet válida en Privy antes de comprar.");
      return;
    }

    setPaying(product.id);

    try {
      try {
        await switchChainAsync({ chainId: celo.id });
      } catch (e) {
        console.log("Ya en Celo Mainnet o usuario canceló switch");
      }

      // [REFI] Logic: Cálculos de impacto y enrutamiento dual
      let targetContractAddress = process.env.NEXT_PUBLIC_TREASURY_SPLITTER_ADDRESS; // Por defecto: Tesorería Biota
      if (product.puebloId.includes("el_carmen")) {
        targetContractAddress = process.env.NEXT_PUBLIC_COLLECTIVE_SPLITTER_ADDRESS; // GoodCollective para El Carmen
      }

      // [CELO] Transaction: Llamadas a la red.
      const tx = await writeContractAsync({
        address: targetContractAddress as `0x${string}`,
        abi: REFI_SPLITTER_CONTRACT.abi,
        functionName: "comprarArtesania",
        args: [getAddress(product.wallet)],
        value: parseEther(product.price),
        chainId: celo.id,
      });
      setPendingProduct({
        id: product.id,
        puebloId: product.puebloId,
        recipient,
      });
      setPaymentHash(tx);
    } catch (error: any) {
      setPaying(null);
      setPaymentHash(undefined);
      setPendingProduct(null);
      alert(
        error.shortMessage ||
          "La transacción falló. Asegúrate de tener saldo en CELO real y estar en Celo Mainnet.",
      );
    }
  }

  // 🟢 NUEVO: Función de pago con GoodDollar
  async function handlePayGoodDollar(product: (typeof NFT_PRODUCTS)[0]) {
    if (!authenticated) return login();

    const recipient = user?.wallet?.address;
    if (!recipient) {
      alert("Conecta una wallet válida en Privy antes de comprar.");
      return;
    }

    setPaying(product.id);

    try {
      try {
        await switchChainAsync({ chainId: celo.id });
      } catch (e) {
        console.log("Ya en Celo Mainnet o usuario canceló switch");
      }

      // [GOODDOLLAR] Connection: Interacción con el ecosistema.
      const tx = await writeContractAsync({
        address: G_DOLLAR_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [getAddress(product.wallet), parseUnits(product.price, 18)],
        chainId: celo.id,
      });

      setPendingProduct({
        id: product.id,
        puebloId: product.puebloId,
        recipient,
      });
      setPaymentHash(tx);
    } catch (error: any) {
      setPaying(null);
      setPaymentHash(undefined);
      setPendingProduct(null);
      alert(
        error.shortMessage ||
          "La transacción falló. Asegúrate de tener saldo de GoodDollar (G$) en Celo Mainnet.",
      );
    }
  }

  const filteredProducts = NFT_PRODUCTS.filter((p) => p.type === category);

  return (
    <div className="flex flex-col gap-5 px-1 pb-24">
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />

      <header className="pt-2 text-center">
        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground italic">
          Mercado Local
        </h2>
        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
          Celo Mainnet 🚀
        </p>
      </header>

      <div className="flex gap-2 p-1.5 bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/10">
        <button
          onClick={() => setCategory("artesanias")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === "artesanias" ? "bg-primary text-white shadow-md" : "text-foreground/50 hover:bg-white/10"}`}
        >
          <Store size={14} /> Artesanías
        </button>
        <button
          onClick={() => setCategory("sellos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === "sellos" ? "bg-primary text-white shadow-md" : "text-foreground/50 hover:bg-white/10"}`}
        >
          <Map size={14} /> Sellos (Sitios/Gemelos)
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredProducts.map((nft) => (
          <div
            key={nft.id}
            className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all ${isDarkMode ? "bg-card border-white/5 shadow-lg shadow-black/20" : "bg-white border-gray-100 shadow-sm"}`}
          >
            <div
              className="relative aspect-square w-full bg-muted cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setImagenAmpliada(nft.img)}
            >
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
            <div className="p-3 flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase truncate text-foreground text-center">
                {nft.name}
              </span>
              <span className="text-[9px] font-mono text-primary font-bold text-center">
                {nft.price}
              </span>

              {/* 🟢 MODIFICACIÓN UI: Botones lado a lado para CELO y G$ */}
              <div className="mt-1 flex gap-1 w-full">
                <button
                  onClick={() => handlePayCelo(nft)}
                  disabled={
                    paying !== null || isConfirmingPayment || paid.has(nft.id)
                  }
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 active:scale-95 ${paid.has(nft.id) ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-primary text-white shadow-md hover:bg-primary/90"}`}
                >
                  {paying === nft.id || isConfirmingPayment ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : paid.has(nft.id) ? (
                    "Mío"
                  ) : (
                    "CELO"
                  )}
                </button>

                {!paid.has(nft.id) && (
                  <button
                    onClick={() => handlePayGoodDollar(nft)}
                    disabled={
                      paying !== null || isConfirmingPayment || paid.has(nft.id)
                    }
                    className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 active:scale-95 bg-green-600 text-white shadow-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {paying === nft.id || isConfirmingPayment ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "G$"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
