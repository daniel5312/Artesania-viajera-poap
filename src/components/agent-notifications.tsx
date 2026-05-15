"use client";

import { useAgent } from "@/lib/agent-context";
import { useEffect, useState } from "react";
import { ShieldCheck, Activity } from "lucide-react";

export function AgentNotifications() {
  const { messages, isLoading } = useAgent();
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [role, setRole] = useState<"CIVIL" | "CAJERO" | null>(null);

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
            setActiveNotification(data.message || "Acción completada exitosamente.");
          } else {
            setActiveNotification(lastMessage.content);
          }
        } catch {
          setActiveNotification("Procesando transacción...");
        }
        
        const timer = setTimeout(() => {
          setActiveNotification(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else if (isLoading) {
      setActiveNotification("Analizando datos de la red...");
    }
  }, [messages, isLoading]);

  if (!activeNotification && !isLoading) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-500">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
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
            {activeNotification || (isLoading ? "Pensando..." : "")}
          </p>
        </div>
      </div>
    </div>
  );
}
