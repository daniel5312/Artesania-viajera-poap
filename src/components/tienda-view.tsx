"use client";

import React, { useEffect, useState } from "react";
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
import { parseEther, getAddress, parseUnits, createPublicClient, http, encodeAbiParameters } from "viem";
import { usePathname } from "next/navigation";
import { celo } from "viem/chains";
import { useTheme } from "@/lib/theme-context";
import { Loader2, CheckCircle, Store, Map } from "lucide-react";
import { ImageModal } from "./image-modal";
import { REFI_SPLITTER_CONTRACT } from "@/constants/contracts";
import { ReFiCheckoutModal } from "./refi-checkout-modal";
import { WalletBalanceButton } from "@/components/wallet-balance-button";
import { ImpactCounter } from "@/components/impact-counter";
import { useAgent } from "@/lib/agent-context";
// 🟢 NUEVO: Configuración de Tokens ERC-20
const G_DOLLAR_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
const USDT_ADDRESS = "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e"; // Dirección correcta de USDT nativo en Celo Mainnet

const publicClient = createPublicClient({ chain: celo, transport: http("https://rpc.ankr.com/celo") });

// 🏦 Treasury Splitter (viejo) — Solo para CELO nativo.
// Pool B = wallet EOA de la DApp. No toca los pools de GoodCollective que rechazan CELO nativo.
const TREASURY_SPLITTER_ADDRESS = "0x8ab653440cef8f4fcf4780b2835f0265b6431392" as const;

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
    badgeId: 1,
    name: "Guatapé",
    price: "0.05",
    puebloId: "guatape_socalos",
    img: "/images/community-1.jpg",
    wallet: "0x6178B5B1447B2E48E0283cd19f0D8eEF2e7C8C1E", // Artesano A
    type: "sellos",
  },
  {
    id: 2,
    badgeId: 2,
    name: "Sombrillas",
    price: "0.05",
    puebloId: "sombrillas_guatape",
    img: "/images/community-2.jpg",
    wallet: "0x1f90a029013609246573f8B3519C8e352333AB0C", // Artesano B
    type: "sellos",
  },
  {
    id: 3,
    badgeId: 3,
    name: "Jardín",
    price: "0.08",
    puebloId: "jardin_cafe",
    img: "/images/product-manilla.jpg",
    wallet: "0x9158C35f1a054F25f9D45EA47107D54a2ea25945", // Artesano X
    type: "artesanias",
  },
  {
    id: 4,
    badgeId: 4,
    name: "Envigado",
    price: "0.05",
    puebloId: "envigado_verde",
    img: "/images/product-sombrero.jpg",
    wallet: "0x9bc43f955ce11948e4fD6EAC28d46875Fba9f5F9", // Artesano Y
    type: "sellos",
  },
  {
    id: 5,
    badgeId: 5,
    name: "Jericó",
    price: "0.01",
    puebloId: "jerico_cuero",
    img: "/images/product-mochila.jpg",
    wallet: "0x6178B5B1447B2E48E0283cd19f0D8eEF2e7C8C1E", // Artesano A
    type: "artesanias",
  },
  {
    id: 6,
    badgeId: 6,
    name: "Mompox",
    price: "0.02",
    puebloId: "mompox_filigrana",
    img: "/images/stamp-guatape.jpg",
    wallet: "0x1f90a029013609246573f8B3519C8e352333AB0C", // Artesano B
    type: "artesanias",
  },
  {
    id: 7,
    badgeId: 7,
    name: "Cerámica El Carmen",
    price: "0.05",
    puebloId: "el_carmen_ceramica",
    img: "/images/community-1.jpg",
    wallet: "0x9158C35f1a054F25f9D45EA47107D54a2ea25945", // Artesano X
    type: "artesanias",
  },
  {
    id: 8,
    badgeId: 8,
    name: "Mochila Biota",
    price: "0.08",
    puebloId: "biota_line",
    img: "/images/product-mochila.jpg",
    wallet: "0x9bc43f955ce11948e4fD6EAC28d46875Fba9f5F9", // Artesano Y
    type: "artesanias",
  },
];

export function TiendaView({ onNavigate }: { onNavigate?: (tab: any) => void } = {}) {
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
    badgeId: number;
    puebloId: string;
    recipient: string;
  } | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sendMessage, isLoading: agentLoading } = useAgent();

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

    const mintBadge = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/mint-badge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient: pendingProduct.recipient,
            badgeId: pendingProduct.badgeId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "No se pudo mintear la insignia.");
        }

        if (cancelled) return;

        setPaid((prev) => new Set(prev).add(pendingProduct.id));
        alert("¡Insignia coleccionada! Apoyo entregado al artesano.");
      } catch (error: any) {
        if (cancelled) return;
        alert(
          error.message || "Pago exitoso, pero hubo un problema con el NFT.",
        );
      } finally {
        if (cancelled) return;

        setPaying(null);
        setPaymentState(null);
        setPaymentHash(undefined);
        setPendingProduct(null);
      }
    };

    void mintBadge();

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

      // [REFI] CELO nativo → Treasury Splitter viejo (Pool B = EOA, acepta CELO)
      // Los pools de GoodCollective NO aceptan CELO nativo, por eso usamos el splitter separado.
      const targetContractAddress = TREASURY_SPLITTER_ADDRESS;

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
        badgeId: product.badgeId,
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

      const targetContractAddress = REFI_SPLITTER_CONTRACT.address;

      const amount = parseUnits(product.price, decimals);

      // Flujo ERC-677: Un solo clic (Cero Approve) para G$
      let tx;
      if (tokenAddress === G_DOLLAR_ADDRESS) {
        setPaymentState("paying");
        const transferAndCallAbi = [
          {
            name: "transferAndCall",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "_to", type: "address" },
              { name: "_value", type: "uint256" },
              { name: "_data", type: "bytes" },
            ],
            outputs: [{ name: "", type: "bool" }],
          },
        ] as const;

        const data = encodeAbiParameters(
          [{ type: "address" }],
          [getAddress(product.wallet)],
        );

        tx = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: transferAndCallAbi,
          functionName: "transferAndCall",
          args: [targetContractAddress as `0x${string}`, amount, data],
          chainId: celo.id,
        });
      } else {
        // Flujo ERC-20 Clásico (Approve + Transfer) para USDT
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

        tx = await writeContractAsync({
          address: targetContractAddress as `0x${string}`,
          abi: REFI_SPLITTER_CONTRACT.abi,
          functionName: "comprarArtesaniaERC20",
          args: [tokenAddress as `0x${string}`, getAddress(product.wallet), amount],
          chainId: celo.id,
        });
      }

      setPendingProduct({
        id: product.id,
        badgeId: product.badgeId,
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

  // ── NEAR style tokens (inline for this component)
  const N = {
    bg:     isDarkMode ? "bg-[#050505] text-[#e2e2df]" : "bg-[#f2efeb] text-[#0d0d0c]",
    card:   isDarkMode ? "bg-[#0d0d0d] border-[#1f1f1e]" : "bg-[#faf9f7] border-[#dcd8d1]",
    inner:  isDarkMode ? "bg-[#121212] border-[#1f1f1e]" : "bg-[#f2efeb] border-[#dcd8d1]",
    muted:  isDarkMode ? "text-[#7a7a78]" : "text-[#6b6862]",
    txt:    isDarkMode ? "text-[#e2e2df]" : "text-[#0d0d0c]",
    mint:   "text-[#5FF5B4]",
    cta:    isDarkMode ? "bg-[#5FF5B4] text-[#050505]" : "bg-[#0d0d0c] text-[#f2efeb]",
    ghost:  isDarkMode ? "border-[#1f1f1e] text-[#7a7a78]" : "border-[#dcd8d1] text-[#6b6862]",
  };

  return (
    <div className={`flex flex-col gap-4 px-3 pb-24 min-h-screen transition-colors ${N.bg}`}>
      <ReFiCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        isMiniPayRoute={isMiniPayRoute}
        onSuccess={async (productId) => {
          try {
             const token = await getAccessToken();
             const res = await fetch("/api/mint-badge", {
               method: "POST",
               headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
               body: JSON.stringify({ recipient: userAddress, badgeId: selectedProduct?.badgeId }),
             });
             const data = await res.json();
             if (res.ok && data.success) setPaid((prev) => new Set(prev).add(productId));
             else alert("Pago exitoso pero error al mintear: " + data.error);
          } catch(e) { console.error(e); alert("Pago exitoso, error de red al mintear."); }
        }}
      />
      <ImageModal src={imagenAmpliada} onClose={() => setImagenAmpliada(null)} />

      {/* Header */}
      <header className="flex justify-between items-center pt-3 px-1">
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${N.muted}`}>
            <Store size={11} /> Digital Museum · Celo Mainnet
          </span>
        </div>
        {onNavigate && <WalletBalanceButton onOpen={() => onNavigate("dashboard")} />}
      </header>

      <ImpactCounter />

      {/* Tab switcher */}
      <div className={`flex gap-1.5 p-1 rounded-2xl border ${N.card}`}>
        {(["artesanias", "sellos"] as const).map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              category === cat
                ? isDarkMode ? "bg-[#5FF5B4] text-[#080808]" : "bg-[#0a0a08] text-[#f7f7f5]"
                : N.muted
            }`}>
            {cat === "artesanias" ? <><Store size={12} /> Artesanías</> : <><Map size={12} /> Sellos</>}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((nft) => (
          <div key={nft.id}
            className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all group hover:opacity-95 active:scale-[0.98] ${N.card}`}>

            {/* Digital Twin badge */}
            <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full border backdrop-blur-md ${isDarkMode ? "bg-black/60 border-[#242422]" : "bg-white/90 border-[#e2e1de]"}`}>
              <span className={`text-[7px] font-black uppercase tracking-widest ${N.mint}`}>Digital Twin</span>
            </div>

            <div className="relative aspect-square w-full cursor-pointer overflow-hidden"
              onClick={() => setImagenAmpliada(nft.img)}>
              <img src={nft.img} alt={nft.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? "from-[#111110]" : "from-white"} via-transparent to-transparent opacity-70`} />
              {paid.has(nft.id) && (
                <div className="absolute inset-0 bg-[#5FF5B4]/10 flex items-center justify-center">
                  <CheckCircle className="text-[#5FF5B4] h-10 w-10" />
                </div>
              )}
            </div>

            <div className="p-3 flex flex-col gap-2">
              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-tight ${N.txt}`}>{nft.name}</span>
                <span className={`text-[10px] font-mono tabular-nums ${N.mint}`}>{nft.price} CELO</span>
              </div>

              {paid.has(nft.id) ? (
                <button disabled className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border ${N.ghost}`}>
                  <CheckCircle size={11} /> Owned
                </button>
              ) : (
                <>
                  <button onClick={() => { setSelectedProduct(nft); setIsModalOpen(true); }}
                    className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${N.cta}`}>
                    Checkout ReFi
                  </button>

                  <button 
                    onClick={() => sendMessage(`El usuario quiere comprar ${nft.name}. Por favor enruta el pago de ${nft.price} CELO al artesano ${nft.wallet}.`, "CAJERO")}
                    disabled={agentLoading}
                    className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-all ${isDarkMode ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-green-600/30 text-green-700 hover:bg-green-600/10"} disabled:opacity-50`}
                  >
                    {agentLoading ? "🤖 Pensando..." : "🤖 Vía CAJERO (x402)"}
                  </button>

                  {/* Fast pay row */}
                  <div className={`flex justify-between items-center px-2 py-1.5 rounded-xl border ${N.inner}`}>
                    {[
                      { label: "G$",   fn: () => handlePayERC20(nft, G_DOLLAR_ADDRESS, 18) },
                      { label: "USDT", fn: () => handlePayERC20(nft, USDT_ADDRESS, 6) },
                      { label: "CELO", fn: () => handlePayCelo(nft) },
                    ].map(({ label, fn }, i) => (
                      <React.Fragment key={label}>
                        {i > 0 && <div className={`w-px h-3 ${isDarkMode ? "bg-[#242422]" : "bg-[#e2e1de]"}`} />}
                        <button onClick={fn}
                          disabled={paying !== null || isConfirmingPayment}
                          className={`text-[8px] font-black uppercase tracking-wider transition-opacity disabled:opacity-40 ${N.muted} hover:${N.mint}`}>
                          {paying === nft.id ? "…" : label}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <section className={`grid grid-cols-2 gap-2 rounded-2xl border p-4 ${N.card}`}>
        <div className={`col-span-2 mb-2 text-[9px] font-black uppercase tracking-[0.15em] ${N.muted}`}>Celo Impact</div>
        <div className={`p-3 rounded-xl border flex flex-col gap-1 ${isDarkMode ? "bg-[#1a1a18] border-[#242422]" : "bg-[#f7f7f5] border-[#e2e1de]"}`}>
          <span className={`text-[8px] font-bold uppercase ${N.muted}`}>UBI Pools</span>
          <span className={`text-xs font-black ${N.mint}`}>2%</span>
          <span className={`text-[8px] ${N.muted}`}>GoodCollective</span>
        </div>
        <div className={`p-3 rounded-xl border flex flex-col gap-1 ${isDarkMode ? "bg-[#1a1a18] border-[#242422]" : "bg-[#f7f7f5] border-[#e2e1de]"}`}>
          <span className={`text-[8px] font-bold uppercase ${N.muted}`}>Tipo de Cambio</span>
          <span className={`text-xs font-black ${N.txt}`}>×4,000</span>
          <span className={`text-[8px] ${N.muted}`}>1 USDT ≈ COP</span>
        </div>
      </section>
    </div>
  );
}
