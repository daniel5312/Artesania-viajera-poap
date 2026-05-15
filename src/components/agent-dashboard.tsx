"use client";

import { useAgent } from "@/lib/agent-context";
import { useEffect, useState, useRef } from "react";
import { Terminal, Activity, CheckCircle2, ChevronRight, Coins, ShieldCheck, ExternalLink } from "lucide-react";

type AgentLog = {
  id: string;
  role: "CIVIL" | "CAJERO";
  timestamp: string;
  type: "text" | "onchain";
  content: string;
  data?: any;
};

export function AgentDashboard() {
  const { messages, isLoading } = useAgent();
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parsear mensajes para extraer logs del agente y ejecuciones on-chain
    const parsedLogs: AgentLog[] = [];
    
    messages.forEach((m, idx) => {
      if (m.role === "assistant" && m.content) {
        const role = m.content.includes("CIVIL") || m.content.includes("Geofence") ? "CIVIL" : "CAJERO";
        const date = new Date().toLocaleTimeString();

        // Extraer ejecuciones on-chain
        if (m.content.includes("[EJECUCIÓN ON-CHAIN]")) {
          const parts = m.content.split("[EJECUCIÓN ON-CHAIN]:");
          
          if (parts[0].trim()) {
            parsedLogs.push({
              id: `text-${idx}`,
              role,
              timestamp: date,
              type: "text",
              content: parts[0].trim()
            });
          }

          try {
            const jsonStr = parts[1].trim().split("\n")[0];
            const data = JSON.parse(jsonStr);
            parsedLogs.push({
              id: `onchain-${idx}`,
              role,
              timestamp: date,
              type: "onchain",
              content: "Ejecución On-Chain Registrada",
              data
            });
          } catch (e) {}
        } else {
          parsedLogs.push({
            id: `text-${idx}`,
            role,
            timestamp: date,
            type: "text",
            content: m.content
          });
        }
      }
    });

    setLogs(parsedLogs);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isLoading]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] font-mono">
      {/* HEADER */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-semibold tracking-wide">Terminal del Agente Autónomo</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="text-xs text-white/50 uppercase tracking-widest">{isLoading ? 'Procesando...' : 'Online'}</span>
        </div>
      </div>

      {/* TERMINAL BODY */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {logs.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>Esperando interacción del usuario...</p>
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Cabecera del log */}
            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <span>[{log.timestamp}]</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.role === 'CIVIL' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                AGENT {log.role}
              </span>
            </div>

            {/* Contenido Texto */}
            {log.type === "text" && (
              <div className="text-white/80 text-sm pl-4 border-l-2 border-white/10 whitespace-pre-wrap">
                {log.content}
              </div>
            )}

            {/* Contenido On-Chain Card */}
            {log.type === "onchain" && log.data && (
              <div className="mt-2 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold uppercase tracking-wider text-sm">{log.data.standard} Protocol</span>
                  </div>
                  <span className="text-xs text-white/40">{log.data.agentWallet ? 'WALLET ACTIVA' : 'SIMULACIÓN'}</span>
                </div>

                {log.data.splits && (
                  <div className="mb-4">
                    <h4 className="text-xs text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Coins className="w-4 h-4" /> Distribución de Pagos
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase">Artesano (90%)</p>
                        <p className="text-emerald-400 font-bold">{log.data.splits.artesano}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase">Tesorería DApp (5%)</p>
                        <p className="text-white/80 font-bold">{log.data.splits.dapp}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase">Pool GoodDollar (2.5%)</p>
                        <p className="text-white/80 font-bold">{log.data.splits.poolGD}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase">Pool Artesanía (2.5%)</p>
                        <p className="text-white/80 font-bold">{log.data.splits.poolArtesania}</p>
                      </div>
                    </div>
                  </div>
                )}

                {log.data.txHashes && log.data.txHashes.length > 0 && (
                  <div>
                    <h4 className="text-xs text-white/50 uppercase tracking-wider mb-2">Transacciones (Celo Mainnet)</h4>
                    <div className="space-y-2">
                      {log.data.txHashes.map((hash: string, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-black/50 p-2 rounded text-xs border border-white/5 hover:border-emerald-500/30 transition-colors">
                          <span className="text-white/60 truncate mr-4">TX {i+1}: {hash}</span>
                          <a href={`https://celoscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0">
                            Ver <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-white/5 text-xs text-white/60 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>{log.data.message}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-white/40 animate-pulse">
            <span className="w-2 h-4 bg-emerald-400 animate-bounce" />
            Agente analizando contexto y firmando transacciones...
          </div>
        )}
      </div>
    </div>
  );
}
