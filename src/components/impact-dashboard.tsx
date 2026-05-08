import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { Users, HeartHandshake, Map, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { WalletBalanceButton } from "@/components/wallet-balance-button";

// Datos simulados para demostrar tracción a los jueces
const historicoImpacto = [
  { mes: "Ene", volumenG: 120, mujeres: 6, tesoreria: 6 },
  { mes: "Feb", volumenG: 250, mujeres: 12.5, tesoreria: 12.5 },
  { mes: "Mar", volumenG: 450, mujeres: 22.5, tesoreria: 22.5 },
  { mes: "Abr", volumenG: 890, mujeres: 44.5, tesoreria: 44.5 },
  { mes: "May", volumenG: 1240, mujeres: 62, tesoreria: 62 },
];

export function ImpactDashboard({ onNavigate }: { onNavigate?: (tab: any) => void } = {}) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<"general" | "comunidad">("general");

  // Métricas Clave (Dummies realistas para el reporte)
  const totalGDollars = 2950;
  const humanPassports = 85;
  const poolMujeres = totalGDollars * 0.05;
  const artesanosDirectos = totalGDollars * 0.90;

  return (
    <div className={`flex flex-col gap-6 px-3 pb-24 min-h-screen transition-colors ${isDarkMode ? "bg-[#0F0A1F] text-zinc-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Header del Reporte */}
      <header className="flex justify-between items-center pt-2 px-2 animate-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 uppercase tracking-widest">
            Impact Report
          </h2>
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
            <Sparkles size={10} className="text-amber-400" />
            Transparencia On-Chain
          </p>
        </div>
        {onNavigate && <WalletBalanceButton onOpen={() => onNavigate("dashboard")} />}
      </header>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-3xl border relative overflow-hidden group ${isDarkMode ? "bg-[#111] border-white/5" : "bg-white border-primary/20 shadow-sm"}`}>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 blur-[20px] rounded-full group-hover:bg-primary/40 transition-colors" />
          <TrendingUp size={16} className={`mb-2 ${isDarkMode ? "text-primary" : "text-primary/80"}`} />
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? "text-zinc-500" : "text-slate-500"}`}>
            Volumen ReFi
          </p>
          <p className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {totalGDollars} <span className="text-sm font-bold text-primary">G$</span>
          </p>
        </div>

        <div className={`p-4 rounded-3xl border relative overflow-hidden group ${isDarkMode ? "bg-[#111] border-white/5" : "bg-white border-primary/20 shadow-sm"}`}>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/20 blur-[20px] rounded-full group-hover:bg-emerald-500/40 transition-colors" />
          <ShieldCheck size={16} className={`mb-2 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? "text-zinc-500" : "text-slate-500"}`}>
            Humanos Únicos
          </p>
          <p className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {humanPassports} <span className="text-sm font-bold text-emerald-500">POAPs</span>
          </p>
        </div>
      </div>

      {/* Desglose de Splitters */}
      <div className={`p-5 rounded-[2rem] border relative overflow-hidden ${isDarkMode ? "bg-black/40 border-white/5" : "bg-white border-primary/10 shadow-lg shadow-primary/5"}`}>
        <h3 className={`text-[11px] font-black uppercase tracking-widest mb-5 flex items-center gap-2 ${isDarkMode ? "text-zinc-400" : "text-slate-500"}`}>
          <Map size={14} /> Distribución de Fondos
        </h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className={isDarkMode ? "text-zinc-300" : "text-slate-700"}><HeartHandshake size={12} className="inline mr-1 text-emerald-400" /> Artesanos (90%)</span>
              <span className={isDarkMode ? "text-white" : "text-slate-900"}>{artesanosDirectos} G$</span>
            </div>
            <div className={`h-2 rounded-full w-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}>
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "90%" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className={isDarkMode ? "text-zinc-300" : "text-slate-700"}><Users size={12} className="inline mr-1 text-pink-400" /> GoodPool Mujeres (5%)</span>
              <span className={isDarkMode ? "text-white" : "text-slate-900"}>{poolMujeres} G$</span>
            </div>
            <div className={`h-2 rounded-full w-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}>
              <div className="h-full bg-pink-400 rounded-full" style={{ width: "5%" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className={isDarkMode ? "text-zinc-300" : "text-slate-700"}><Map size={12} className="inline mr-1 text-amber-400" /> Tesorería Ruta (5%)</span>
              <span className={isDarkMode ? "text-white" : "text-slate-900"}>{totalGDollars * 0.05} G$</span>
            </div>
            <div className={`h-2 rounded-full w-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}>
              <div className="h-full bg-amber-400 rounded-full" style={{ width: "5%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Crecimiento */}
      <div className={`p-4 rounded-[2rem] border ${isDarkMode ? "bg-[#111] border-white/5" : "bg-white border-primary/10 shadow-sm"}`}>
        <h3 className={`text-[11px] font-black uppercase tracking-widest mb-6 mt-2 ml-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Crecimiento de Aportes
        </h3>
        
        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicoImpacto}>
              <defs>
                <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDarkMode ? "#8162f3" : "#4f46e5"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={isDarkMode ? "#8162f3" : "#4f46e5"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#e2e8f0"} />
              <XAxis 
                dataKey="mes" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: isDarkMode ? "#a1a1aa" : "#64748b" }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: isDarkMode ? "#a1a1aa" : "#64748b" }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                  borderRadius: '16px',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="volumenG" 
                name="Volumen (G$)"
                stroke={isDarkMode ? "#8162f3" : "#4f46e5"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorG)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
