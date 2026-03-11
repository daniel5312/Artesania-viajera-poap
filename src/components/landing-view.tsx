"use client";

import { useState } from "react";
import {
  Sparkles,
  MapPin,
  ChevronRight,
  Wallet,
  Shield,
  Zap,
  Globe,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { usePrivy } from "@privy-io/react-auth";

// --- LOGO DE CELO (SVG) ---
const CeloLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M80 150C118.66 150 150 118.66 150 80C150 41.3401 118.66 10 80 10C41.3401 10 10 41.3401 10 80C10 118.66 41.3401 150 80 150Z"
      stroke="#35D07F"
      strokeWidth="12"
    />
    <path
      d="M55 125C79.8528 125 100 104.853 100 80C100 55.1472 79.8528 35 55 35C30.1472 35 10 55.1472 10 80C10 104.853 30.1472 125 55 125Z"
      stroke="#FBCC5C"
      strokeWidth="12"
    />
  </svg>
);

const routes = [
  {
    id: 1,
    name: "Guatapé",
    region: "Antioquia",
    image:
      "https://images.unsplash.com/photo-1590505194931-18e47083070d?q=80&w=500",
    crafts: 12,
    collectors: 847,
  },
  {
    id: 2,
    name: "Medellín",
    region: "Valle de Aburrá",
    image:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=500",
    crafts: 28,
    collectors: 1243,
  },
  {
    id: 3,
    name: "Filandia",
    region: "Quindío",
    image:
      "https://images.unsplash.com/photo-1582650809054-6e6962363577?q=80&w=500",
    crafts: 15,
    collectors: 562,
  },
];

const stamps = [
  { id: 1, village: "Guatapé", collected: true },
  { id: 2, village: "El Peñol", collected: true },
  { id: 3, village: "Jardín", collected: false },
  { id: 4, village: "Filandia", collected: false },
];

export function LandingView({ onEnter }: { onEnter: () => void }) {
  const { isDarkMode, toggleTheme, lang, toggleLang } = useTheme();
  const { login, authenticated, logout, user } = usePrivy();
  const [hoveredRoute, setHoveredRoute] = useState<number | null>(null);

  const address = user?.wallet?.address;
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 font-sans selection:bg-purple-200 ${isDarkMode ? "bg-[#0F0A1F] text-white" : "bg-[#faf8f5] text-[#2D2D2D]"}`}
    >
      {/* --- HEADER SUPERIOR --- */}
      <nav className="fixed top-0 left-0 right-0 z-index[100] px-4 pt-4">
        <div
          className={`mx-auto max-w-md flex items-center justify-between p-3 rounded-full border backdrop-blur-xl shadow-lg transition-colors ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-[#4505A4]/10"}`}
        >
          <div className="flex items-center gap-2 pl-2">
            <CeloLogo />
            <span
              className={`font-serif italic font-bold text-sm ${isDarkMode ? "text-purple-300" : "text-[#4505A4]"}`}
            >
              AV
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Dark Mode */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${isDarkMode ? "bg-purple-900/40 text-yellow-400 hover:bg-purple-800" : "bg-[#4505A4]/5 text-[#4505A4] hover:bg-[#4505A4]/10"}`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Wallet Button */}
            <button
              onClick={authenticated ? logout : login}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                authenticated
                  ? "bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30"
                  : "bg--to-r from-[#4505A4] to-[#8162f3] text-white shadow-md active:scale-95"
              }`}
            >
              <Wallet className="w-3 h-3" />
              {authenticated ? shortAddress : "Conectar"}
              {authenticated && <LogOut className="w-3 h-3 ml-1 opacity-50" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Woven texture background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] bg-repeat"
        style={{ backgroundSize: "400px" }}
      />

      {/* Animated orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`animate-orb-1 absolute -left-32 top-20 h-96 w-96 rounded-full blur-3xl transition-colors ${isDarkMode ? "bg-purple-600/20" : "bg-[#4505A4]/10"}`}
        />
        <div
          className={`animate-orb-2 absolute -right-32 top-1/3 h-80 w-80 rounded-full blur-3xl transition-colors ${isDarkMode ? "bg-blue-600/20" : "bg-[#E9D5FF]/40"}`}
        />
        <div
          className={`animate-orb-3 absolute bottom-20 left-1/4 h-72 w-72 rounded-full blur-3xl transition-colors ${isDarkMode ? "bg-emerald-600/10" : "bg-[#35D07F]/10"}`}
        />
      </div>

      <div className="relative mx-auto max-w-md px-5 pb-32 pt-24">
        {/* --- HERO SECTION --- */}
        <header className="text-center animate-fade-in-up">
          <div
            className={`mx-auto mb-6 w-fit rounded-full border px-4 py-2 backdrop-blur-md ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-[#4505A4]/20"}`}
          >
            <div
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? "text-purple-300" : "text-[#4505A4]"}`}
            >
              <span className="h-2 w-2 rounded-full bg-[#35D07F] animate-pulse shadow-[0_0_8px_#35D07F]" />
              Celo Mainnet
            </div>
          </div>

          <h1 className="leading-tight">
            <span
              className={`block text-6xl font-black tracking-tighter bg-linear-to-r ${isDarkMode ? "from-purple-300 via-indigo-400 to-amber-200" : "from-[#4505A4] via-[#8162f3] to-[#d97706]"} bg-clip-text text-transparent`}
            >
              Artesanía
            </span>
            <span
              className={`block font-serif text-4xl italic mt-1 ${isDarkMode ? "text-white/80" : "text-[#4505A4]/80"}`}
            >
              Viajera
            </span>
          </h1>

          <p
            className={`mt-6 text-sm leading-relaxed font-medium ${isDarkMode ? "text-white/60" : "text-[#4505A4]/60"}`}
          >
            Colecciona artesanías colombianas auténticas como gemelos NFT.
            <br />
            <span className="font-serif italic">
              Tu viaje, grabado para siempre en la red.
            </span>
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-[#4505A4] to-[#8162f3] px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Empezar Viaje
              </span>
              <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent translate-x--100%" />
            </button>
          </div>
        </header>

        {/* Hero Image */}
        <div className="relative mt-12 px-2">
          <div
            className={`relative mx-auto aspect-4/3 w-full overflow-hidden rounded-[2.5rem] shadow-2xl border-4 ${isDarkMode ? "border-white/10 shadow-black/50" : "border-white shadow-purple-500/10"}`}
          >
            <img
              src="https://images.unsplash.com/photo-1610413340321-72993866380c?q=80&w=600"
              alt="Artesanía"
              className="h-full w-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-linear-to-t ${isDarkMode ? "from-[#0F0A1F]/80" : "from-[#4505A4]/30"} via-transparent to-transparent`}
            />
          </div>
        </div>

        {/* Featured Routes */}
        <section className="mt-20">
          <div className="mb-6 flex items-center justify-between">
            <h2
              className={`text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-[#4505A4]"}`}
            >
              Rutas Destacadas
            </h2>
            <button className="text-[10px] font-black uppercase tracking-widest opacity-50">
              Ver todas
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-5 px-5">
            {routes.map((route) => (
              <div
                key={route.id}
                className={`relative shrink-0 w-60 overflow-hidden rounded-4xl shadow-xl transition-all ${isDarkMode ? "bg-white/5" : "bg-white"}`}
              >
                <img
                  src={route.image}
                  className="h-40 w-full object-cover"
                  alt={route.name}
                />
                <div className="p-5">
                  <span className="text-[9px] font-bold opacity-50 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500" /> {route.region}
                  </span>
                  <h3 className="text-lg font-black mt-1">{route.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MiniPay Footer */}
        <footer
          className={`mt-20 rounded-[2.5rem] border p-8 text-center transition-colors ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-[#35D07F]/20 shadow-xl"}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-[#35D07F]" />
            <span className="text-lg font-black tracking-tight">
              Optimizado para MiniPay
            </span>
          </div>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
            Paga con cUSD • cCOP • CELO
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes orb-float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(15px, -25px);
          }
        }
        .animate-orb-1 {
          animation: orb-float 12s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: orb-float 15s ease-in-out infinite reverse;
        }
        .animate-orb-3 {
          animation: orb-float 18s ease-in-out infinite 1s;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
