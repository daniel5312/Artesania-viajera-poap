import { AgentDashboard } from "@/components/agent-dashboard";

export default function AgentesBackofficePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest text-emerald-400">Backoffice de Inteligencia Artificial</h1>
          <p className="text-white/50 text-sm mt-2">Monitoreo y registros de actividad del Agente CAJERO y CIVIL (ERC-8004 / x402).</p>
        </header>
        
        <AgentDashboard />
      </div>
    </div>
  );
}
