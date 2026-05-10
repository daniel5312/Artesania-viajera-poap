"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import {
  Sparkles, Wallet, Globe, Leaf, Smartphone, Shield,
  Heart, Moon, Sun, Map, Paintbrush, ArrowRight, CheckCircle,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useTheme } from "@/lib/theme-context";
import { useGlobal } from "@/lib/global-context";

// ─── Role Selection Card ──────────────────────────────────────────────────
function RoleCard({
  role, title, subtitle, emoji, features, selected, onSelect, isDarkMode,
}: {
  role: "turista" | "artesano";
  title: string; subtitle: string; emoji: string;
  features: string[];
  selected: boolean; onSelect: () => void; isDarkMode: boolean;
}) {
  const color = role === "turista" ? "emerald" : "purple";
  const activeClass = selected
    ? role === "turista"
      ? "border-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.25)] bg-emerald-500/10"
      : "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.25)] bg-purple-500/10"
    : isDarkMode
      ? "border-white/10 bg-white/5 hover:border-white/20"
      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md";

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 ${activeClass}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <p className="font-black text-sm uppercase tracking-widest">{title}</p>
          <p className={`text-[10px] ${isDarkMode ? "text-zinc-400" : "text-slate-500"}`}>{subtitle}</p>
        </div>
        {selected && (
          <CheckCircle
            size={18}
            className={role === "turista" ? "text-emerald-500 ml-auto" : "text-purple-500 ml-auto"}
          />
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {features.map((f) => (
          <li key={f} className={`text-[10px] flex items-center gap-2 ${isDarkMode ? "text-zinc-300" : "text-slate-600"}`}>
            <span className={`w-1 h-1 rounded-full shrink-0 ${role === "turista" ? "bg-emerald-500" : "bg-purple-500"}`} />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────
export function LandingView({ onEnter }: { onEnter: () => void }) {
  const { isDarkMode, toggleTheme, lang, toggleLang } = useTheme();
  const { userRole, setUserRole } = useGlobal();

  const { login, authenticated: authPrivy, logout: logoutPrivy, user } = usePrivy();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"hero" | "role">("hero");
  const [selectedRole, setSelectedRole] = useState<"turista" | "artesano" | null>(userRole);

  useEffect(() => { setMounted(true); }, []);

  const isMiniPayRoute = pathname?.includes("/minipay");
  const authenticated = isMiniPayRoute ? authWagmi : authPrivy;
  const address = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  // Si ya está autenticado con rol definido → entrar directo
  useEffect(() => {
    if (authenticated && userRole) onEnter();
  }, [authenticated, userRole]);

  function handleLogout() {
    if (isMiniPayRoute) disconnectWagmi();
    else logoutPrivy();
  }

  function handleRoleConfirm() {
    if (!selectedRole) return;
    setUserRole(selectedRole);
    // Si ya está autenticado, entrar directo
    if (authenticated) { onEnter(); return; }
    // Si no, lanzar login
    if (!isMiniPayRoute) login();
    else onEnter(); // MiniPay se conecta automáticamente en AppShell
  }

  if (!mounted) return null;

  return (
    <div className={`relative min-h-screen font-sans transition-colors duration-500 pb-20 ${isDarkMode ? "text-zinc-100" : "text-slate-900"}`}>

      {/* HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className={`mx-auto max-w-md flex items-center justify-between p-3 rounded-full border backdrop-blur-xl shadow-lg ${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/80 border-primary/20"}`}>
          <div className="flex items-center gap-2 pl-2">
            <div className={`w-2 h-2 rounded-full bg-primary animate-pulse`} />
            <span className={`font-black text-sm tracking-widest uppercase ${isDarkMode ? "text-zinc-100" : "text-primary"}`}>
              Artesanía Viajera
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className={`p-2 rounded-full font-black text-xs ${isDarkMode ? "text-emerald-400 hover:bg-white/10" : "text-emerald-700 hover:bg-slate-200"}`}>
              {lang === "es" ? "EN" : "ES"}
            </button>
            <button onClick={toggleTheme} className={`p-2 rounded-full ${isDarkMode ? "text-yellow-400 hover:bg-white/10" : "text-slate-700 hover:bg-slate-200"}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {authenticated ? (
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wallet size={14} /> {shortAddress}
              </button>
            ) : (!isMiniPayRoute && step === "hero" && (
              <button onClick={() => setStep("role")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "border border-primary/50 text-primary hover:bg-primary/10" : "bg-primary text-white hover:bg-primary/90"}`}>
                <Wallet size={14} /> {lang === "es" ? "Entrar" : "Enter"}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      {step === "hero" && (
        <div className="relative mx-auto max-w-md px-6 pt-32 pb-8 flex flex-col justify-center text-center">
          <div className="animate-fade-in-up space-y-4 flex flex-col justify-center items-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isDarkMode ? "bg-primary/10 border-primary/30 text-primary" : "bg-primary/5 border-primary/20 text-primary"}`}>
              <Globe size={12} /> ReFi Ecosystem · Celo Mainnet
            </div>

            <h1 className="text-5xl sm:text-6xl font-black leading-[1.1] tracking-tighter">
              <span className={`text-transparent bg-clip-text bg-gradient-to-br ${isDarkMode ? "from-white to-zinc-600" : "from-slate-600 to-black"}`}>
                {lang === "es" ? "Artesanía" : "Nomad"}
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-800 italic">
                {lang === "es" ? "Viajera" : "Artisans"}
              </span>
            </h1>

            <p className={`text-sm leading-relaxed max-w-xs ${isDarkMode ? "text-zinc-400" : "text-slate-600"}`}>
              {lang === "es"
                ? "Sellos NFT que abren rutas gamificadas. Apoya artesanos con ReFi."
                : "NFT stamps that unlock gamified routes. Support artisans with ReFi."}
            </p>

            <button
              onClick={() => setStep("role")}
              className="mt-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {lang === "es" ? "Comenzar" : "Get Started"} <ArrowRight size={16} />
            </button>
          </div>

          {/* Bento info */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className={`col-span-2 p-5 rounded-[2rem] border relative overflow-hidden ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50/80 border-emerald-200"}`}>
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/20 blur-[30px] rounded-full" />
              <Heart className="text-emerald-500 mb-3 h-6 w-6" />
              <h2 className={`text-xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {lang === "es" ? "El Encuentro Único" : "The Unique Encounter"}
              </h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-slate-600"}`}>
                {lang === "es"
                  ? "Cada Phygital NFT documenta el encuentro entre el turista y el artesano en la blockchain."
                  : "Each Phygital NFT documents the encounter between tourist and artisan on-chain."}
              </p>
            </div>
            <div className={`p-5 rounded-[2rem] border flex flex-col items-center text-center ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
              <Smartphone className="text-[#35D07F] mb-2 h-6 w-6" />
              <h3 className={`text-sm font-black uppercase ${isDarkMode ? "text-white" : "text-slate-900"}`}>MiniPay</h3>
            </div>
            <div className={`p-5 rounded-[2rem] border flex flex-col items-center text-center ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
              <Shield className="text-[#00A3FF] mb-2 h-6 w-6" />
              <h3 className={`text-sm font-black uppercase ${isDarkMode ? "text-white" : "text-slate-900"}`}>GoodDollar</h3>
            </div>
            <div className={`col-span-2 p-5 rounded-[2rem] border flex flex-col items-center text-center ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
              <Leaf className={`h-6 w-6 mb-2 ${isDarkMode ? "text-emerald-400" : "text-emerald-500"}`} />
              <h2 className={`text-sm font-black uppercase ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                {lang === "es" ? "Ruteo de Impacto" : "Impact Routing"}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* ── ROLE SELECTION ── */}
      {step === "role" && (
        <div className="relative mx-auto max-w-md px-5 pt-28 pb-10 flex flex-col gap-5 animate-fade-in-up">
          <div className="text-center mb-2">
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {lang === "es" ? "¿Quién eres?" : "Who are you?"}
            </h2>
            <p className={`text-[11px] mt-1 ${isDarkMode ? "text-zinc-400" : "text-slate-500"}`}>
              {lang === "es"
                ? "Elige tu rol para personalizar la experiencia"
                : "Choose your role to personalize the experience"}
            </p>
          </div>

          <RoleCard
            role="turista"
            title={lang === "es" ? "Turista Viajero" : "Traveling Tourist"}
            subtitle={lang === "es" ? "Colecciona sellos y explora rutas" : "Collect stamps & explore routes"}
            emoji="🧳"
            features={
              lang === "es"
                ? ["Mapa gamificado de Antioquia", "Bóveda de rutas desbloqueables", "Tienda de Sellos & Artesanías", "Comunidad y momentos"]
                : ["Gamified map of Antioquia", "Vault of unlockable routes", "Stamps & Crafts store", "Community & moments"]
            }
            selected={selectedRole === "turista"}
            onSelect={() => setSelectedRole("turista")}
            isDarkMode={isDarkMode}
          />

          <RoleCard
            role="artesano"
            title={lang === "es" ? "Artesano Local" : "Local Artisan"}
            subtitle={lang === "es" ? "Gestiona tus ventas y métricas ReFi" : "Manage your sales & ReFi metrics"}
            emoji="🎨"
            features={
              lang === "es"
                ? ["Métricas ReFi on-chain en vivo", "Saldo ganado por ventas", "Donaciones de GoodPools", "UBI & Superfluid Stream"]
                : ["Live on-chain ReFi metrics", "Balance earned from sales", "GoodPools donations", "UBI & Superfluid Stream"]
            }
            selected={selectedRole === "artesano"}
            onSelect={() => setSelectedRole("artesano")}
            isDarkMode={isDarkMode}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep("hero")}
              className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${isDarkMode ? "border-white/10 text-zinc-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              {lang === "es" ? "Volver" : "Back"}
            </button>
            <button
              onClick={handleRoleConfirm}
              disabled={!selectedRole}
              className={`flex-[2] py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                selectedRole === "turista"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : selectedRole === "artesano"
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              {lang === "es" ? "Confirmar y Entrar" : "Confirm & Enter"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat scale-105 blur-[6px] ${isDarkMode ? "opacity-60" : "opacity-80"}`}
          style={{ backgroundImage: "url('/images/IMG_20240818_020953188_HDR_AE.jpg')", backgroundPosition: "center 30%" }}
        />
        <div className={`absolute inset-0 ${isDarkMode ? "bg-gradient-to-b from-[#02120A]/70 via-[#062417]/50 to-[#000000]/80" : "bg-gradient-to-b from-emerald-50/60 via-emerald-100/40 to-emerald-50/80"}`} />
        <div className={`absolute top-1/4 -left-32 w-96 h-96 blur-[150px] rounded-full ${isDarkMode ? "bg-emerald-500/20" : "bg-emerald-300/20"}`} />
        <div className={`absolute bottom-1/4 -right-32 w-96 h-96 blur-[150px] rounded-full ${isDarkMode ? "bg-emerald-400/10" : "bg-emerald-200/30"}`} />
      </div>

      <footer className={`absolute bottom-0 left-0 right-0 py-6 text-center border-t ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
        <p className={`text-sm font-medium ${isDarkMode ? "text-zinc-500" : "text-slate-500"}`}>
          © {new Date().getFullYear()} Artesanía Viajera. {lang === "es" ? "Construido en Celo." : "Built on Celo."}
        </p>
      </footer>
    </div>
  );
}
