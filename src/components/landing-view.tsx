"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronRight,
  Wallet,
  Shield,
  Zap,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { usePrivy } from "@privy-io/react-auth";

// --- LOGO COPm (Basado en tu imagen) ---
const COPmLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative w-8 h-8 rounded-full bg-linear-to-br from-[#4505A4] to-[#8162f3] flex items-center justify-center border-2 border-[#FBCC5C] shadow-sm">
      <span className="text-[10px] font-black text-white italic">COP</span>
    </div>
    <span className="font-black text-xl tracking-tighter flex items-baseline">
      <span className="text-[#4505A4] dark:text-white">COP</span>
      <span className="text-[#FB923C] text-sm">m</span>
    </span>
  </div>
);

const features = [
  {
    title: "Estabilidad Digital",
    desc: "Garantizada para tu confianza y seguridad financiera.",
    icon: <Shield className="w-5 h-5 text-[#FBCC5C]" />,
  },
  {
    title: "Transacciones Celo",
    desc: "Rápidas y eficientes en la red Celo, respaldadas por el COP.",
    icon: <Zap className="w-5 h-5 text-[#35D07F]" />,
  },
  {
    title: "Auditoría en Cadena",
    desc: "Transparencia total y cumplimiento continuo 24/7.",
    icon: <CheckCircle2 className="w-5 h-5 text-[#8162f3]" />,
  },
];

export function LandingView({ onEnter }: { onEnter: () => void }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { login, authenticated, logout, user } = usePrivy();

  const address = user?.wallet?.address;
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 font-sans ${isDarkMode ? "bg-[#0F0A1F] text-white" : "bg-[#fafafa] text-[#2D2D2D]"}`}
    >
      {/* --- HEADER --- */}
      <nav className="fixed top-0 left-0 right-0 z-100 px-4 pt-4">
        <div
          className={`mx-auto max-w-md flex items-center justify-between p-3 rounded-full border backdrop-blur-xl shadow-lg transition-all ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-[#4505A4]/10"}`}
        >
          <COPmLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${isDarkMode ? "bg-white/10 text-yellow-400" : "bg-[#4505A4]/5 text-[#4505A4]"}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={authenticated ? logout : login}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authenticated ? "bg-[#35D07F]/20 text-[#35D07F]" : "bg-[#4505A4] text-white shadow-lg"}`}
            >
              <Wallet size={14} />
              {authenticated ? shortAddress : "Conectar"}
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative mx-auto max-w-md px-6 pt-32 pb-20 text-center">
        <header className="animate-fade-in">
          <h1 className="text-4xl font-black leading-tight tracking-tighter mb-4">
            <span className="block text-[#4505A4] dark:text-white">
              El Peso Colombiano
            </span>
            <span className="block bg-linear-to-r from-[#4505A4] to-[#FB923C] bg-clip-text text-transparent italic">
              es Digital
            </span>
          </h1>
          <p className="text-sm font-medium opacity-70 mb-8 px-4">
            Bienvenido a COPm, la stablecoin respaldada por pesos colombianos en
            la red de Celo.
          </p>

          <button
            onClick={onEnter}
            className="w-full bg-linear-to-r from-[#4505A4] to-[#8162f3] text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Sparkles /> Empezar Experiencia
          </button>
        </header>

        {/* --- FEATURE CARDS --- */}
        <div className="mt-16 grid gap-4 text-left">
          {features.map((f, i) => (
            <div
              key={i}
              className={`p-6 rounded-4xl border transition-all ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-[#4505A4]/5 shadow-sm"}`}
            >
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-1">
                {f.title}
              </h3>
              <p className="text-xs opacity-60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* --- BACKED BY SECTION (Como en la imagen) --- */}
        <section className="mt-20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">
            Respaldado por Expertos
          </h4>
          <div className="flex items-center justify-center gap-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
            {/* Mento Labs Simulado */}
            <div className="flex items-center gap-1 font-bold text-sm">
              <div className="w-4 h-4 border-2 border-current rotate-45" />{" "}
              MENTO
            </div>
            {/* COP Circle */}
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-[8px] font-black">
              COP
            </div>
            {/* Celo Simulado */}
            <div className="flex items-center gap-1 font-bold text-sm italic underline decoration-[#35D07F]">
              CELO
            </div>
          </div>
        </section>
      </div>

      {/* Decorative Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className={`absolute -top-24 -left-24 w-96 h-96 blur-[120px] rounded-full ${isDarkMode ? "bg-purple-900/30" : "bg-purple-100"}`}
        />
        <div
          className={`absolute top-1/2 -right-24 w-80 h-80 blur-[100px] rounded-full ${isDarkMode ? "bg-orange-900/20" : "bg-orange-50"}`}
        />
      </div>
    </div>
  );
}
