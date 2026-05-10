import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, HeartHandshake, Map, ShieldCheck, TrendingUp, Activity } from "lucide-react";
import { WalletBalanceButton } from "@/components/wallet-balance-button";

const historicoImpacto = [
  { mes: "Ene", volumenG: 120,  mujeres: 6,    tesoreria: 6 },
  { mes: "Feb", volumenG: 250,  mujeres: 12.5, tesoreria: 12.5 },
  { mes: "Mar", volumenG: 450,  mujeres: 22.5, tesoreria: 22.5 },
  { mes: "Abr", volumenG: 890,  mujeres: 44.5, tesoreria: 44.5 },
  { mes: "May", volumenG: 1240, mujeres: 62,   tesoreria: 62 },
];

export function ImpactDashboard({ onNavigate }: { onNavigate?: (tab: any) => void } = {}) {
  const { isDarkMode: d } = useTheme();

  const totalGDollars   = 2950;
  const humanPassports  = 85;
  const poolMujeres     = totalGDollars * 0.05;
  const artesanosShare  = totalGDollars * 0.90;

  // NEAR style tokens
  const N = {
    bg:    d ? "bg-[#050505] text-[#e2e2df]" : "bg-[#f2efeb] text-[#0d0d0c]",
    card:  d ? "bg-[#0d0d0d] border-[#1f1f1e]" : "bg-[#faf9f7] border-[#dcd8d1]",
    inner: d ? "bg-[#121212] border-[#1f1f1e]" : "bg-[#f2efeb] border-[#dcd8d1]",
    muted: d ? "text-[#7a7a78]" : "text-[#6b6862]",
    txt:   d ? "text-[#e2e2df]" : "text-[#0d0d0c]",
    mint:  "text-[#5FF5B4]",
    bar:   d ? "#5FF5B4" : "#00a368",
    grid:  d ? "#1f1f1e" : "#dcd8d1",
    tick:  d ? "#7a7a78" : "#6b6862",
    tooltip: d
      ? { backgroundColor: "#0d0d0d", border: "1px solid #1f1f1e", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", color: "#e2e2df" }
      : { backgroundColor: "#faf9f7", border: "1px solid #dcd8d1", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", color: "#0d0d0c" },
  };

  const kpis = [
    { icon: TrendingUp, label: "Volumen ReFi",    value: `${totalGDollars}`, unit: "G$",   accent: true },
    { icon: ShieldCheck, label: "Humanos Únicos", value: `${humanPassports}`, unit: "POAPs", accent: false },
  ];

  const splits = [
    { icon: HeartHandshake, label: "Artesanos", pct: 90, val: artesanosShare },
    { icon: Users,          label: "GoodPool Mujeres", pct: 5,  val: poolMujeres },
    { icon: Map,            label: "Tesorería Ruta",   pct: 5,  val: totalGDollars * 0.05 },
  ];

  return (
    <div className={`flex flex-col gap-4 px-3 pb-24 min-h-screen transition-colors ${N.bg}`}>

      {/* Header */}
      <header className="flex justify-between items-center pt-3 px-1">
        <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${N.muted}`}>
          <Activity size={11} /> Impact Report · On-Chain
        </span>
        {onNavigate && <WalletBalanceButton onOpen={() => onNavigate("dashboard")} />}
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2">
        {kpis.map(({ icon: Icon, label, value, unit, accent }) => (
          <div key={label} className={`p-4 rounded-2xl border relative overflow-hidden ${N.card}`}>
            {d && accent && (
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#5FF5B4]/8 blur-[30px]" />
            )}
            <Icon size={14} className={`mb-2 ${accent ? N.mint : N.muted}`} />
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${N.muted}`}>{label}</p>
            <p className={`text-2xl font-black tabular-nums leading-none ${N.txt}`}>
              {value}
              <span className={`text-sm font-bold ml-1 ${accent ? N.mint : N.muted}`}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Fund Distribution */}
      <section className={`p-5 rounded-2xl border ${N.card}`}>
        <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5 ${N.muted}`}>
          <Map size={12} /> Distribución de Fondos
        </p>
        <div className="flex flex-col gap-4">
          {splits.map(({ icon: Icon, label, pct, val }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${N.muted}`}>
                  <Icon size={11} /> {label} ({pct}%)
                </span>
                <span className={`text-[11px] font-black tabular-nums ${N.txt}`}>{val} G$</span>
              </div>
              {/* Progress bar — neutral track, mint fill */}
              <div className={`h-1.5 rounded-full w-full overflow-hidden ${d ? "bg-[#242422]" : "bg-[#e2e1de]"}`}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: d ? "#5FF5B4" : "#00c27b" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Growth Chart */}
      <section className={`p-4 rounded-2xl border ${N.card}`}>
        <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-5 ml-1 ${N.muted}`}>
          Crecimiento de Aportes
        </p>
        <div className="h-44 w-full -ml-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicoImpacto}>
              <defs>
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={N.bar} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={N.bar} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={N.grid} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: N.tick }} dy={8} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: N.tick }} width={36} />
              <Tooltip contentStyle={N.tooltip} />
              <Area type="monotone" dataKey="volumenG" name="Volumen (G$)"
                stroke={N.bar} strokeWidth={2}
                fillOpacity={1} fill="url(#mintGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
