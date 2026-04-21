"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import {
  Sparkles,
  Wallet,
  Globe,
  Leaf,
  Smartphone,
  Shield,
  Heart,
  Moon,
  Sun,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useTheme } from "@/lib/theme-context";

export function LandingView({ onEnter }: { onEnter: () => void }) {
  const { isDarkMode, toggleTheme, lang, toggleLang } = useTheme();

  // 🟢 Lógica Híbrida
  const {
    login,
    authenticated: authPrivy,
    logout: logoutPrivy,
    user,
  } = usePrivy();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMiniPayRoute = pathname?.includes("/minipay");
  const authenticated = isMiniPayRoute ? authWagmi : authPrivy;
  const address = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  function handleLogout() {
    if (isMiniPayRoute) disconnectWagmi();
    else logoutPrivy();
  }

  if (!mounted) return null;

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 pb-20 ${isDarkMode ? "text-zinc-100" : "text-slate-900"}`}
    >
      {/* --- HEADER --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div
          className={`mx-auto max-w-md flex items-center justify-between p-3 rounded-full border backdrop-blur-xl shadow-lg transition-all ${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/80 border-primary/20"}`}
        >
          <div className="flex items-center gap-2 pl-2">
            <div
              className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-primary" : "bg-primary"} animate-pulse-glow`}
            />
            <span
              className={`font-black text-sm tracking-widest uppercase ${isDarkMode ? "text-zinc-100" : "text-primary"}`}
            >
              Artesanía Viajera
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className={`p-2 rounded-full font-black text-xs transition-all ${isDarkMode ? "text-emerald-400 hover:bg-white/10" : "text-emerald-700 hover:bg-slate-200"}`}
              aria-label="Toggle language"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${isDarkMode ? "text-yellow-400 hover:bg-white/10" : "text-slate-700 hover:bg-slate-200"}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {authenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              >
                <Wallet size={14} />
                {shortAddress}
              </button>
            ) : (
              !isMiniPayRoute && (
                <button
                  onClick={login}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? "bg-transparent text-primary border border-primary/50 shadow-[0_0_15px_rgba(129,98,243,0.3)] hover:bg-primary/10" : "bg-primary text-white shadow-md hover:bg-primary/90"}`}
                >
                  <Wallet size={14} />
                  {lang === "es" ? "Conectar" : "Connect"}
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative mx-auto max-w-md px-6 pt-32 pb-8 flex flex-col justify-center text-center">
        <div className="animate-fade-in-up space-y-2 flex flex-col justify-center items-center">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isDarkMode ? "bg-primary/10 border-primary/30 text-primary" : "bg-primary/5 border-primary/20 text-primary"}`}
          >
            <Globe size={12} /> ReFi Ecosystem
          </div>

          <h1
            className="text-5xl sm:text-6xl font-black leading-[1.1] tracking-tighter"
          >
            <span
              className={`text-transparent bg-clip-text bg-gradient-to-br ${isDarkMode ? "from-white to-zinc-600" : "from-slate-600 to-black"}`}
            >
              {lang === "es" ? "Artesanía" : "Nomad"}
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-black italic">
              {lang === "es" ? "Viajera" : "Artisans"}
            </span>
          </h1>

          <button
            onClick={onEnter}
            className="mt-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {lang === "es" ? "Explorar Colección" : "Explore Collection"} <Sparkles size={16} />
          </button>
        </div>
      </div>

      {/* --- BENTO BOX INFORMATIVO --- */}
      <div className="mx-auto max-w-md px-4 grid grid-cols-2 gap-3 mt-4">
        {/* Core Value */}
        {/* Core Value */}
        <div
          className={`col-span-2 p-6 rounded-[2rem] border relative overflow-hidden ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-900/20" : "bg-emerald-50/80 border-emerald-200 shadow-md shadow-emerald-100"}`}
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/20 blur-[30px] rounded-full" />
          <Heart className="text-emerald-500 mb-4 h-8 w-8" />
          <h2
            className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            {lang === "es" ? "El Encuentro Único" : "The Unique Encounter"}
          </h2>
          <p
            className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-slate-700"}`}
          >
            {lang === "es" ? (
              <>
                Cada Phygital NFT documenta el encuentro irrepetible entre el{" "}
                <strong>turista</strong> y el <strong>artesano</strong>, respaldando
                sus creaciones en la blockchain.
              </>
            ) : (
              <>
                Each Phygital NFT documents the unrepeatable encounter between the{" "}
                <strong>tourist</strong> and the <strong>artisan</strong>, backing
                their creations on the blockchain.
              </>
            )}
          </p>
        </div>

        {/* Celo & MiniPay */}
        <div
          className={`p-6 rounded-[2rem] border relative overflow-hidden flex flex-col justify-center items-center text-center ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-900/20" : "bg-emerald-50/80 border-emerald-200 shadow-md shadow-emerald-100"}`}
        >
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-emerald-500/20 blur-[20px] rounded-full" />
          <Smartphone className="text-[#35D07F] mb-3 h-8 w-8" />
          <h3
            className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            MiniPay & Celo
          </h3>
        </div>

        {/* GoodDollar UBI */}
        <div
          className={`p-6 rounded-[2rem] border relative overflow-hidden flex flex-col justify-center items-center text-center ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-900/20" : "bg-emerald-50/80 border-emerald-200 shadow-md shadow-emerald-100"}`}
        >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/20 blur-[20px] rounded-full" />
          <Shield className="text-[#00A3FF] mb-3 h-8 w-8" />
          <h3
            className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            GoodDollar
          </h3>
        </div>

        {/* Impact Pools */}
        <div
          className={`col-span-2 p-6 rounded-[2rem] border relative overflow-hidden flex flex-col items-center justify-center text-center ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-900/20" : "bg-emerald-50/80 border-emerald-200 shadow-md shadow-emerald-100"}`}
        >
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-emerald-500/20 blur-[30px] rounded-full" />
          <Leaf
            className={`h-10 w-10 mb-2 ${isDarkMode ? "text-emerald-400" : "text-emerald-500"}`}
          />
          <h2
            className={`text-2xl font-black uppercase tracking-tight z-10 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
          >
            {lang === "es" ? "Ruteo de Impacto" : "Impact Routing"}
          </h2>
        </div>
      </div>

      {/* Background Image, Overlays & Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Blurred Background Image */}
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat scale-105 blur-[6px] ${isDarkMode ? "opacity-60" : "opacity-80"}`}
          style={{ backgroundImage: "url('/images/IMG_20240818_020953188_HDR_AE.jpg')", backgroundPosition: "center 30%" }}
        />
        {/* Gradient Overlay for Text Legibility */}
        <div
          className={`absolute inset-0 ${isDarkMode ? "bg-gradient-to-b from-[#02120A]/70 via-[#062417]/50 to-[#000000]/80" : "bg-gradient-to-b from-emerald-50/60 via-emerald-100/40 to-emerald-50/80"}`}
        />
        {/* Orbs */}
        <div
          className={`absolute top-1/4 -left-32 w-96 h-96 blur-[150px] rounded-full ${isDarkMode ? "bg-emerald-500/20" : "bg-emerald-300/20"}`}
        />
        <div
          className={`absolute bottom-1/4 -right-32 w-96 h-96 blur-[150px] rounded-full ${isDarkMode ? "bg-emerald-400/10" : "bg-emerald-200/30"}`}
        />
      </div>

      {/* Footer */}
      <footer
        className={`absolute bottom-0 left-0 right-0 py-6 text-center border-t transition-colors ${isDarkMode ? "border-white/10" : "border-slate-200"}`}
      >
        <p
          className={`text-sm font-medium ${isDarkMode ? "text-zinc-500" : "text-slate-500"}`}
        >
          © {new Date().getFullYear()} Artesanía Viajera. {lang === "es" ? "Construido en Celo." : "Built on Celo."}
        </p>
      </footer>
    </div>
  );
}
