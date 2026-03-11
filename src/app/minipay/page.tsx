"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import sdk from "@farcaster/frame-sdk";
import { Loader2 } from "lucide-react";

import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { WalletHeader } from "@/components/wallet-header";
import { BottomNav } from "@/components/bottom-nav";
import { PasaporteView } from "@/components/pasaporte-view";
import { TiendaView } from "@/components/tienda-view";
import { ComunidadView } from "@/components/comunidad-view";
import { MomentosView } from "@/components/momentos-view";
import FarcasterLoader from "@/components/farcasterLoader";
import { LandingView } from "@/components/landing-view";

type Tab = "pasaporte" | "tienda" | "comunidad" | "momentos";

function AppShell() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isAutoMinting, setIsAutoMinting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("pasaporte");

  const selloPendiente = searchParams.get("sello");

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) sdk.actions.ready();
    if (authenticated || selloPendiente) {
      setShowLanding(false);
    }
  }, [authenticated, selloPendiente]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // 🪄 AUTO-MINT LOGIC (Sin cambios)
  useEffect(() => {
    const autoMint = async () => {
      if (
        selloPendiente &&
        authenticated &&
        wallets.length > 0 &&
        !isAutoMinting
      ) {
        setIsAutoMinting(true);
        const wallet = wallets[0];
        try {
          const response = await fetch("/api/mint-passport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: wallet.address,
              tipo: `Sello ${selloPendiente}`,
            }),
          });
          if (response.ok) alert(`¡Magia! 🪄 Sello añadido.`);
        } catch (error) {
          console.error("Error en auto-mint:", error);
        } finally {
          setIsAutoMinting(false);
          router.replace("/", { scroll: false });
        }
      }
    };
    autoMint();
  }, [selloPendiente, authenticated, wallets, isAutoMinting, router]);

  if (!mounted) return null;

  // --- RENDEREADO DE LA LANDING ---
  if (showLanding && !selloPendiente) {
    return <LandingView onEnter={() => setShowLanding(false)} />;
  }

  // --- VISTA GLOBAL CON FONDO CYBER-ARTESANAL ---
  return (
    <div
      className={`mx-auto min-h-screen max-w-md relative overflow-hidden transition-colors duration-500 
      ${isDarkMode ? "bg-[#0F0A1F] text-white" : "bg-[#faf8f5] text-[#2D2D2D]"}`}
    >
      {/* --- CAPA DE FONDO GLOBAL --- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Textura de tejido sutil */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] bg-repeat"
          style={{ backgroundSize: "400px" }}
        />

        {/* Orbes Animados (Púrpuras y Verdes) */}
        <div
          className={`animate-orb-1 absolute -left-32 top-20 h-96 w-96 rounded-full blur-[80px] transition-colors duration-1000 ${isDarkMode ? "bg-purple-600/20" : "bg-[#4505A4]/10"}`}
        />
        <div
          className={`animate-orb-2 absolute -right-32 top-1/3 h-80 w-80 rounded-full blur-[80px] transition-colors duration-1000 ${isDarkMode ? "bg-blue-600/20" : "bg-[#E9D5FF]/40"}`}
        />
        <div
          className={`animate-orb-3 absolute bottom-20 left-1/4 h-72 w-72 rounded-full blur-[80px] transition-colors duration-1000 ${isDarkMode ? "bg-emerald-600/10" : "bg-[#35D07F]/10"}`}
        />
      </div>

      {/* --- CONTENIDO DE LA APP --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <FarcasterLoader />

        {/* El Header ahora debe ser transparente o glassmorphism */}
        <WalletHeader />

        {/* Overlay de Carga */}
        {isAutoMinting && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-black uppercase">
              Estampando Sello...
            </h2>
          </div>
        )}

        {/* Alerta de Sello */}
        {selloPendiente && !authenticated && (
          <div className="mx-5 mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-center animate-pulse z-20">
            <p className="text-sm font-bold text-primary mb-2">
              ¡Sello de {selloPendiente} esperando!
            </p>
            <button
              onClick={login}
              className="text-xs bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg"
            >
              Conectar Wallet
            </button>
          </div>
        )}

        <main className="mt-2 pb-24 px-4 overflow-y-auto flex-1">
          {activeTab === "pasaporte" && (
            <PasaporteView onNavigate={setActiveTab} />
          )}
          {activeTab === "tienda" && <TiendaView />}
          {activeTab === "momentos" && <MomentosView />}
          {activeTab === "comunidad" && <ComunidadView />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* --- KEYFRAMES DE ANIMACIÓN --- */}
      <style jsx global>{`
        @keyframes orb-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -30px) scale(1.1);
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
      `}</style>
    </div>
  );
}

export default function MiniPayPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#0F0A1F]" />}>
        <AppShell />
      </Suspense>
    </ThemeProvider>
  );
}
