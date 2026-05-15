"use client";

import { useAgent } from "@/lib/agent-context";
import { useEffect, useState } from "react";
import { ShieldCheck, Activity, CheckCircle2, Coins, ExternalLink, X } from "lucide-react";

export function AgentNotifications() {
  const { messages, isLoading } = useAgent();
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [role, setRole] = useState<"CIVIL" | "CAJERO" | null>(null);
  const [onchainData, setOnchainData] = useState<any | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role === "assistant" && lastMessage.content) {
      if (lastMessage.content.includes("CIVIL") || lastMessage.content.includes("Check-in") || lastMessage.content.includes("coordenadas")) {
        setRole("CIVIL");
      } else if (lastMessage.content.includes("CAJERO") || lastMessage.content.includes("Pago") || lastMessage.content.includes("enruta")) {
        setRole("CAJERO");
      }
      
      if (lastMessage.content.includes("[EJECUCIÓN ON-CHAIN]")) {
        try {
          const match = lastMessage.content.match(/\[EJECUCIÓN ON-CHAIN\]:\s*({.*})/);
          if (match && match[1]) {
            const data = JSON.parse(match[1]);
            setOnchainData(data); // Guardamos la data para el modal gigante
            setActiveNotification(null); // Ocultamos el toast pequeño
          } else {
            setActiveNotification(lastMessage.content);
          }
        } catch {
          setActiveNotification("Procesando transacción...");
        }
      } else {
        // Si no hay ejecución on-chain, mostramos solo toast
        setActiveNotification(lastMessage.content);
        const timer = setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else if (isLoading) {
      setActiveNotification("Analizando orden...");
      setOnchainData(null);
    }
  }, [messages, isLoading]);

  // Si hay datos On-Chain, mostramos el Gran Modal Centrado
  if (onchainData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-md bg-[#0F0A1F] border border-emerald-500/30 rounded-[2rem] overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-300">
          
          <button onClick={() => setOnchainData(null)} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
            <X size={16} />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">¡Pago Ejecutado!</h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-emerald-400">
              Agente Autónomo CAJERO
            </p>
          </div>

          <div className="space-y-4">
            {onchainData.splits && (
              <div className="bg-black/40 rounded-2xl border border-white/5 p-4">
                <h4 className="text-[10px] text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Coins size={12} /> Distribución Calculada
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Artesano Local (90%)</span>
                    <span className="text-emerald-400 font-bold">{onchainData.splits.artesano}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Tesorería DApp (5%)</span>
                    <span className="text-white font-bold">{onchainData.splits.dapp}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Pool GoodDollar (2.5%)</span>
                    <span className="text-white font-bold">{onchainData.splits.poolGD}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Pool Artesanía (2.5%)</span>
                    <span className="text-white font-bold">{onchainData.splits.poolArtesania}</span>
                  </div>
                </div>
              </div>
            )}

            {onchainData.txHashes && (
              <div className="bg-black/40 rounded-2xl border border-white/5 p-4">
                <h4 className="text-[10px] text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={12} /> Transacciones (Celo Mainnet)
                </h4>
                <div className="space-y-2">
                  {onchainData.txHashes.map((hash: string, i: number) => (
                    <a key={i} href={`https://celoscan.io/tx/${hash}`} target="_blank" rel="noreferrer" 
                      className="flex items-center justify-between bg-white/5 p-2 rounded-xl text-xs hover:bg-white/10 transition-colors border border-transparent hover:border-emerald-500/30 group">
                      <span className="text-white/60 truncate mr-4">TX {i+1}: {hash}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button onClick={() => setOnchainData(null)} className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/20">
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Toast pequeño mientras piensa o habla
  if (!activeNotification && !isLoading) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-500">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${role === 'CIVIL' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
          {isLoading ? (
            <Activity className="w-5 h-5 animate-pulse" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
            {role ? `Agente ${role}` : "Artesanía Viajera"}
          </p>
          <p className="text-sm font-medium text-white leading-snug">
            {activeNotification || (isLoading ? "Pensando y firmando..." : "")}
          </p>
        </div>
      </div>
    </div>
  );
}
