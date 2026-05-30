import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { Loader2, X, CheckCircle, AlertCircle, HeartHandshake, Map, ArrowRight, Users, Activity, ExternalLink, Coins } from "lucide-react";
import { useReFiPayment } from "@/hooks/useReFiPayment";
import { useAgent } from "@/lib/agent-context";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: string;
  wallet: string;
  puebloId: string;
  img: string;
}

interface ReFiCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (productId: number) => void;
  isMiniPayRoute: boolean;
}

export function ReFiCheckoutModal({ isOpen, onClose, product, onSuccess, isMiniPayRoute }: ReFiCheckoutModalProps) {
  const { isDarkMode } = useTheme();
  const { executePayment, paymentState, resetPaymentState, G_DOLLAR_ADDRESS, USDT_ADDRESS } = useReFiPayment();
  const [selectedToken, setSelectedToken] = useState<"G$" | "USDT" | "CELO">("CELO");

  const { sendMessage, messages, isLoading: agentLoading } = useAgent();
  const [onchainData, setOnchainData] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      resetPaymentState();
      setSelectedToken("CELO");
      setOnchainData(null);
    }
  }, [isOpen, resetPaymentState]);

  useEffect(() => {
    if (messages.length === 0 || !isOpen) return;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role === "assistant" && lastMessage.content.includes("[EJECUCIÓN ON-CHAIN]")) {
      try {
        const match = lastMessage.content.match(/\[EJECUCIÓN ON-CHAIN\]:\s*({.*})/);
        if (match && match[1]) {
          const data = JSON.parse(match[1]);
          setOnchainData(data);
        }
      } catch (e) {
        console.error("Error parseando onchain data", e);
      }
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (paymentState === "success" && product && !onchainData) {
      const timer = setTimeout(() => {
        onSuccess(product.id);
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [paymentState, product, onSuccess, onClose, onchainData]);

  if (!isOpen || !product) return null;

  // Calculamos el desglose original basado en el precio
  const priceValue = parseFloat(product.price);
  const artisanShare = (priceValue * 0.90).toFixed(4).replace(/\.?0+$/, "");
  const poolShare = (priceValue * 0.05).toFixed(4).replace(/\.?0+$/, "");
  const treasuryShare = (priceValue * 0.05).toFixed(4).replace(/\.?0+$/, "");
  const isCollective = product.puebloId.includes("el_carmen");

  const handleConfirmPaymentWagmi = async () => {
    try {
      const tokenAddress = selectedToken === "G$" ? G_DOLLAR_ADDRESS : USDT_ADDRESS;
      const decimals = selectedToken === "G$" ? 18 : 6;
      await executePayment(product.price, tokenAddress, decimals, product.wallet, isCollective, isMiniPayRoute);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmPaymentAgent = async () => {
    await sendMessage(`El usuario confirmó el aporte a ${product.name}. Por favor enruta el pago de ${product.price} ${selectedToken} al artesano ${product.wallet}.`, "CAJERO");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border ${isDarkMode ? "bg-[#0F0A1F] border-white/10" : "bg-white border-primary/20"} animate-in zoom-in-95 duration-300`}>
        
        {/* Header con Imagen */}
        <div className="relative h-32 w-full">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1F] to-transparent" />
          <button 
            onClick={onClose}
            disabled={paymentState === "approving" || paymentState === "paying" || agentLoading}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className={`p-6 -mt-8 relative z-10 rounded-t-[2rem] h-96 overflow-y-auto ${isDarkMode ? "bg-[#0F0A1F]" : "bg-white"}`}>
          
          <div className="text-center mb-6">
            <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {product.name}
            </h2>
            <p className={`text-xs font-medium uppercase tracking-widest mt-1 ${isDarkMode ? "text-zinc-500" : "text-slate-500"}`}>
              Checkout Regenerativo
            </p>
          </div>

          {/* Selección de Token */}
          <div className={`flex p-1 rounded-xl mb-6 ${isDarkMode ? "bg-white/5" : "bg-slate-100"}`}>
            <button onClick={() => setSelectedToken("CELO")} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedToken === "CELO" ? "bg-emerald-500 text-white shadow-md" : "text-zinc-500 hover:text-emerald-500"}`}>CELO</button>
            <button onClick={() => setSelectedToken("G$")} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedToken === "G$" ? "bg-primary text-white shadow-md" : "text-zinc-500 hover:text-primary"}`}>G$</button>
            <button onClick={() => setSelectedToken("USDT")} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedToken === "USDT" ? "bg-emerald-500 text-white shadow-md" : "text-zinc-500 hover:text-emerald-500"}`}>USDT</button>
          </div>

          {/* Desglose Original de Impacto (ReFi) */}
          <div className={`mb-6 p-4 rounded-2xl border ${isDarkMode ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200"}`}>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-dashed border-zinc-500/30">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? "text-zinc-400" : "text-slate-500"}`}>Aporte Total</span>
              <span className={`text-lg font-black ${selectedToken === "G$" ? "text-primary" : "text-emerald-500"}`}>
                {product.price} {selectedToken}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HeartHandshake size={14} className="text-emerald-400" />
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-zinc-300" : "text-slate-700"}`}>Artesano Local (90%)</span>
                </div>
                <span className={`text-[11px] font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{artisanShare}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-pink-400" />
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-zinc-300" : "text-slate-700"}`}>GoodPool Mujeres (5%)</span>
                </div>
                <span className={`text-[11px] font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{poolShare}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Map size={14} className="text-amber-400" />
                  <span className={`text-[10px] font-semibold ${isDarkMode ? "text-zinc-300" : "text-slate-700"}`}>Tesorería Ruta (5%)</span>
                </div>
                <span className={`text-[11px] font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{treasuryShare}</span>
              </div>
            </div>
          </div>

          {/* Botones de Acción (Wagmi y Agente CAJERO) */}
          {!onchainData && (
            <div className="flex flex-col gap-2 items-center">
              {paymentState === "idle" || paymentState === "error" ? (
                <>
                  <button
                    onClick={handleConfirmPaymentWagmi}
                    className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${
                      selectedToken === "G$" ? "bg-primary text-white" : "bg-emerald-500 text-white"
                    }`}
                  >
                    Confirmar (Usuario) <ArrowRight size={14} />
                  </button>

                  <div className="w-full flex items-center gap-4 my-2 opacity-50">
                    <div className="h-px flex-1 bg-zinc-500"></div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">O usa IA</span>
                    <div className="h-px flex-1 bg-zinc-500"></div>
                  </div>

                  {agentLoading ? (
                    <div className="w-full py-4 rounded-2xl bg-zinc-800 text-white flex flex-col items-center justify-center gap-2">
                      <Activity size={20} className="animate-pulse text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Agente Procesando...</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmPaymentAgent}
                      className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    >
                      🤖 Ejecutar vía Agente CAJERO
                    </button>
                  )}
                </>
              ) : paymentState === "approving" || paymentState === "paying" ? (
                <div className="w-full py-4 rounded-2xl bg-zinc-800 text-white flex flex-col items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                    {paymentState === "approving" ? "Aprobando Token..." : "Transfiriendo Aporte..."}
                  </span>
                </div>
              ) : paymentState === "success" ? (
                <div className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center gap-2 animate-in zoom-in">
                  <CheckCircle size={24} className="drop-shadow-[0_0_10px_rgba(52,211,127,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">¡Aporte Exitoso!</span>
                </div>
              ) : null}

              {paymentState === "error" && (
                <div className="mt-2 flex items-center gap-1.5 text-red-400 text-[9px] font-bold uppercase">
                  <AlertCircle size={12} /> Transacción fallida. Intenta de nuevo.
                </div>
              )}
            </div>
          )}

          {/* Información nueva del Cajero */}
          {onchainData && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex flex-col items-center text-center mb-4">
                {onchainData.success === false ? (
                  <>
                    <AlertCircle size={24} className="text-red-400 mb-2" />
                    <h3 className="text-sm font-black uppercase tracking-tight text-red-500">¡Fallo en el Cajero!</h3>
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} className="text-emerald-400 mb-2" />
                    <h3 className="text-sm font-black uppercase tracking-tight text-white">¡Ejecución CAJERO Exitosa!</h3>
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                {onchainData.success === false && onchainData.message && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-[10px] font-bold">
                    {onchainData.message}
                  </div>
                )}
                {onchainData.splits && (
                  <>
                    <h4 className="text-[9px] text-white/50 uppercase tracking-widest flex items-center gap-2">
                      <Coins size={10} /> Nueva Distribución Real:
                    </h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70">Artesano</span>
                      <span className="text-emerald-400 font-bold">{onchainData.splits.artesano}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70">Tesoreria</span>
                      <span className="text-white font-bold">{onchainData.splits.dapp}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70">GoodDollar</span>
                      <span className="text-white font-bold">{onchainData.splits.poolGD}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/70">Artesanía</span>
                      <span className="text-white font-bold">{onchainData.splits.poolArtesania}</span>
                    </div>
                  </>
                )}

                {onchainData.txHashes && (
                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-[9px] text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Activity size={10} /> Transacciones On-Chain:
                    </h4>
                    <div className="space-y-1">
                      {onchainData.txHashes.map((hash: string, i: number) => (
                        <div key={i} className="flex justify-between items-center text-[9px]">
                          <span className="text-white/60">TX {i+1}</span>
                          <a href={`https://celoscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="text-emerald-400 flex items-center gap-1 hover:underline">
                            {hash.substring(0,8)}... <ExternalLink size={8} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link href="/agentes" onClick={onClose} className="mt-4 w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5">
                  <Activity size={12} /> Ver Log en Backoffice
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
