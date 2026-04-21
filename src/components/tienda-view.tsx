"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useConnect,
  useConnectors,
} from "wagmi";
import { parseEther, getAddress, parseUnits, createPublicClient, http } from "viem";
import { usePathname } from "next/navigation";
import { celo } from "viem/chains";
import { useTheme } from "@/lib/theme-context";
import { Loader2, CheckCircle, Store, Map } from "lucide-react";
import { ImageModal } from "./image-modal";
import { REFI_SPLITTER_CONTRACT } from "@/constants/contracts";

// 🟢 NUEVO: Configuración de Tokens ERC-20
const G_DOLLAR_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
const USDT_ADDRESS = "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e"; // Dirección correcta de USDT nativo en Celo Mainnet

const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });

const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
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
  const { user, authenticated: authPrivy, login, getAccessToken } = usePrivy();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const { isDarkMode } = useTheme();

  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");

  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();

  const isUserAuthenticated = isMiniPayRoute ? authWagmi : authPrivy;
  const userAddress = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const [category, setCategory] = useState<"artesanias" | "sellos">(
    "artesanias",
  );
  const [paying, setPaying] = useState<number | null>(null);
  const [paid, setPaid] = useState<Set<number>>(new Set());
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | undefined>();
  const [paymentState, setPaymentState] = useState<"approving" | "paying" | null>(null);
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
    setPaymentState(null);
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
        setPaymentState(null);
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
    if (!isUserAuthenticated) {
      if (!isMiniPayRoute) return login();
      else {
        const injected = connectors.find((c) => c.id === "injected") || connectors[0];
        if (injected) {
           try {
             await connectAsync({ connector: injected });
             alert("¡Billetera conectada! Por favor, dale clic al botón de pago de nuevo.");
           } catch(e) {
             alert("Error conectando MiniPay. Intenta refrescar la página.");
           }
        } else {
           alert("MiniPay no detectado. Refresca la página.");
        }
        return;
      }
    }

    const recipient = userAddress;
    if (!recipient) {
      alert("Conecta una wallet válida antes de comprar.");
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
      let targetContractAddress =
        process.env.NEXT_PUBLIC_TREASURY_SPLITTER_ADDRESS; // Por defecto: Tesorería Biota
      if (product.puebloId.includes("el_carmen")) {
        targetContractAddress =
          process.env.NEXT_PUBLIC_COLLECTIVE_SPLITTER_ADDRESS; // GoodCollective para El Carmen
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
      setPaymentState(null);
      setPaymentHash(undefined);
      setPendingProduct(null);
      alert(
        error.shortMessage ||
          "La transacción falló. Asegúrate de tener saldo en CELO real y estar en Celo Mainnet.",
      );
    }
  }

  // 🟢 NUEVO: Función de pago Unificada ERC-20 (USDT / G$) con flujo de 2 pasos
  async function handlePayERC20(product: (typeof NFT_PRODUCTS)[0], tokenAddress: string, decimals: number) {
    if (!isUserAuthenticated) {
      if (!isMiniPayRoute) return login();
      else {
        const injected = connectors.find((c) => c.id === "injected") || connectors[0];
        if (injected) {
           try {
             await connectAsync({ connector: injected });
             alert("¡Billetera conectada! Por favor, dale clic al botón de pago de nuevo.");
           } catch(e) {
             alert("Error conectando MiniPay. Intenta refrescar la página.");
           }
        } else {
           alert("MiniPay no detectado. Refresca la página.");
        }
        return;
      }
    }

    const recipient = userAddress;
    if (!recipient) {
      alert("Conecta una wallet válida antes de comprar.");
      return;
    }

    setPaying(product.id);
    setPaymentState("approving");

    try {
      try {
        await switchChainAsync({ chainId: celo.id });
      } catch (e) {
        console.log("Ya en Celo Mainnet o usuario canceló switch");
      }

      let targetContractAddress = process.env.NEXT_PUBLIC_TREASURY_SPLITTER_ADDRESS;
      if (product.puebloId.includes("el_carmen")) {
        targetContractAddress = process.env.NEXT_PUBLIC_COLLECTIVE_SPLITTER_ADDRESS;
      }

      const amount = parseUnits(product.price, decimals);

      // Paso 1: Check Allowance & Approve
      const allowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [recipient as `0x${string}`, targetContractAddress as `0x${string}`],
      });

      if (allowance < amount) {
        const approveTx = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [targetContractAddress as `0x${string}`, amount],
        });
        
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      setPaymentState("paying");

      // Paso 2: Pay (comprarArtesaniaERC20)
      const tx = await writeContractAsync({
        address: targetContractAddress as `0x${string}`,
        abi: REFI_SPLITTER_CONTRACT.abi,
        functionName: "comprarArtesaniaERC20",
        args: [tokenAddress as `0x${string}`, getAddress(product.wallet), amount],
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
      setPaymentState(null);
      setPaymentHash(undefined);
      setPendingProduct(null);
      alert(
        error.shortMessage ||
          "La transacción falló. Asegúrate de tener saldo suficiente y probar de nuevo.",
      );
    }
  }

  const filteredProducts = NFT_PRODUCTS.filter((p) => p.type === category);

  return (
    <div className={`flex flex-col gap-6 px-2 pb-24 min-h-screen transition-colors ${isDarkMode ? "bg-gradient-to-b from-[#0F0A1F] to-[#000000] text-zinc-100" : "bg-gradient-to-b from-slate-50 to-slate-200 text-slate-900"}`}>
      <ImageModal
        src={imagenAmpliada}
        onClose={() => setImagenAmpliada(null)}
      />

      <header className="pt-4 text-center">
        <h2 className={`text-2xl font-black uppercase tracking-widest ${isDarkMode ? "text-white" : "text-primary"}`}>
          Digital Museum
        </h2>
        <p className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${isDarkMode ? "text-zinc-500" : "text-slate-500"}`}>
          Preserving heritage on Celo Mainnet 🌐
        </p>
      </header>

      <div className={`flex gap-2 p-1.5 backdrop-blur-md rounded-2xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-primary/20 shadow-sm"}`}>
        <button
          onClick={() => setCategory("artesanias")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === "artesanias" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:bg-white/10"}`}
        >
          <Store size={14} /> Artesanías
        </button>
        <button
          onClick={() => setCategory("sellos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === "sellos" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:bg-white/10"}`}
        >
          <Map size={14} /> Sellos Digitales
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {filteredProducts.map((nft) => (
          <div
            key={nft.id}
            className={`relative flex flex-col rounded-3xl overflow-hidden border transition-all group ${isDarkMode ? "border-white/5 bg-[#0a0a0a] shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(129,98,243,0.15)]" : "border-primary/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-primary/10"}`}
          >
            {/* Etiqueta Dorada Digital Twin */}
            <div className={`absolute top-2 left-2 z-10 px-2 py-1 backdrop-blur-md rounded-full border ${isDarkMode ? "bg-black/60 border-amber-500/30" : "bg-white/80 border-amber-400"}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${isDarkMode ? "text-amber-500" : "text-amber-600"}`}>
                ✨ Digital Twin Included
              </span>
            </div>

            <div
              className="relative aspect-square w-full cursor-pointer overflow-hidden"
              onClick={() => setImagenAmpliada(nft.img)}
            >
              <img
                src={nft.img}
                alt={nft.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${paid.has(nft.id) ? "grayscale-0" : "grayscale-[0.3]"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
              
              {paid.has(nft.id) && (
                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="text-emerald-400 h-10 w-10 drop-shadow-[0_0_15px_rgba(52,211,127,0.5)] animate-in zoom-in" />
                </div>
              )}
            </div>
            
            <div className={`p-3 flex flex-col gap-2 relative z-20 -mt-6 rounded-t-3xl ${isDarkMode ? "bg-[#0a0a0a]" : "bg-white"}`}>
              <div className="flex flex-col justify-center items-center">
                <span className={`text-[11px] font-black uppercase tracking-tight text-center ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {nft.name}
                </span>
                <span className={`text-[10px] font-mono font-bold mt-0.5 ${isDarkMode ? "text-primary/80" : "text-primary"}`}>
                  {nft.price} CELO
                </span>
              </div>

              {/* Botones de pago estilo museo (USDT/G$ prominentes) */}
              <div className="mt-1 flex flex-col gap-1 w-full">
                {paid.has(nft.id) ? (
                   <button disabled className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                     <CheckCircle size={12}/> Owned
                   </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePayERC20(nft, USDT_ADDRESS, 6)}
                        disabled={paying !== null || isConfirmingPayment}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 active:scale-95 ${isDarkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                      >
                        {paying === nft.id && paymentState === "approving" ? <Loader2 className="h-3 w-3 animate-spin" /> : paying === nft.id && paymentState === "paying" ? "..." : "USDT"}
                      </button>
                      <button
                        onClick={() => handlePayERC20(nft, G_DOLLAR_ADDRESS, 18)}
                        disabled={paying !== null || isConfirmingPayment}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 active:scale-95 border ${isDarkMode ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"}`}
                      >
                        {paying === nft.id && paymentState === "approving" ? <Loader2 className="h-3 w-3 animate-spin" /> : paying === nft.id && paymentState === "paying" ? "..." : "G$"}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Opción fallback CELO muy minimalista */}
                {!paid.has(nft.id) && (
                   <button
                     onClick={() => handlePayCelo(nft)}
                     disabled={paying !== null || isConfirmingPayment}
                     className={`w-full py-1 text-[8px] font-bold uppercase transition-colors ${isDarkMode ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-primary"}`}
                   >
                     {paying === nft.id || isConfirmingPayment ? "..." : "CELO Nativo"}
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- REFI BENTO BOX FOOTER --- */}
      <section className="mt-8 grid grid-cols-2 gap-3 animate-fade-in-up delay-200">
        <div className={`col-span-2 border rounded-3xl p-5 relative overflow-hidden ${isDarkMode ? "bg-[#111] border-white/5" : "bg-white border-primary/10 shadow-sm"}`}>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />
          <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Celo Impact</h3>
          <p className={`text-[10px] leading-relaxed max-w-[80%] ${isDarkMode ? "text-zinc-400" : "text-slate-600"}`}>
            Fully transparent ledger. Transactions use less energy than a single Google search.
          </p>
        </div>
        
        <div className={`border rounded-3xl p-4 flex flex-col justify-between ${isDarkMode ? "bg-[#111] border-white/5" : "bg-white border-primary/10 shadow-sm"}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? "text-zinc-500" : "text-slate-400"}`}>UBI Funding</h3>
          <p className={`text-[11px] font-medium ${isDarkMode ? "text-zinc-300" : "text-slate-700"}`}>
            2% routed to GoodCollective Pools.
          </p>
        </div>

        <div className={`border rounded-3xl p-4 flex flex-col justify-between ${isDarkMode ? "bg-[#111] border-white/5" : "bg-white border-primary/10 shadow-sm"}`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? "text-zinc-500" : "text-slate-400"}`}>Fiat Ref</h3>
          <p className={`text-[11px] font-medium ${isDarkMode ? "text-zinc-300" : "text-slate-700"}`}>
            1 USDT ≈ 4,000 COP local economy.
          </p>
        </div>
      </section>
    </div>
  );
}
