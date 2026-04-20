"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useAccount, useConnect, useConnectors } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";

import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { WalletHeader } from "@/components/wallet-header";
import { BottomNav } from "@/components/bottom-nav";
import { PasaporteView } from "@/components/pasaporte-view";
import { TiendaView } from "@/components/tienda-view";
import { ComunidadView } from "@/components/comunidad-view";
import { MomentosView } from "@/components/momentos-view";
import { LandingView } from "@/components/landing-view";

type Tab = "pasaporte" | "tienda" | "comunidad" | "momentos";

function AppShell() {
  const [selectedSello, setSelectedSello] = useState<any | null>(null);

  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");

  const { authenticated: authPrivy, user } = usePrivy();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const connectors = useConnectors();
  const { connect } = useConnect();

  const isConnected = isMiniPayRoute ? authWagmi : authPrivy;
  const address = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isAutoMinting, setIsAutoMinting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("pasaporte");

  const selloPendiente = searchParams.get("sello");
  const isDevMode = searchParams.get("dev") === "true";

  useEffect(() => {
    setMounted(true);
    const checkMiniPay =
      typeof window !== "undefined" && !!(window as any).ethereum?.isMiniPay;

    if (
      isMiniPayRoute &&
      (checkMiniPay || isDevMode) &&
      !authWagmi &&
      connectors.length > 0
    ) {
      const injected =
        connectors.find((c) => c.id === "injected") || connectors[0];
      if (injected) connect({ connector: injected });
    }
  }, [connectors, connect, authWagmi, isMiniPayRoute, isDevMode]);

  useEffect(() => {
    if (isConnected || selloPendiente) {
      setShowLanding(false);
    } else {
      setShowLanding(true);
    }
  }, [isConnected, selloPendiente]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const autoMint = async () => {
      if (selloPendiente && isConnected && address && !isAutoMinting) {
        setIsAutoMinting(true);
        try {
          const response = await fetch("/api/mint-passport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: address,
              tipo: `Sello ${selloPendiente}`,
            }),
          });
          if (response.ok) alert(`¡Sello añadido!`);
        } catch (error) {
          console.error(error);
        } finally {
          setIsAutoMinting(false);
          router.replace(isMiniPayRoute ? "/minipay" : "/", { scroll: false });
        }
      }
    };
    autoMint();
  }, [
    selloPendiente,
    isConnected,
    address,
    isAutoMinting,
    router,
    isMiniPayRoute,
  ]);

  if (!mounted) return null;

  if (showLanding && !selloPendiente)
    return <LandingView onEnter={() => setShowLanding(false)} />;

  return (
    <div
      className={`mx-auto min-h-screen max-w-md relative overflow-hidden transition-colors duration-500 ${isDarkMode ? "bg-[#0F0A1F] text-white" : "bg-[#faf8f5] text-[#2D2D2D]"}`}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/woven.png')] bg-repeat"
          style={{ backgroundSize: "400px" }}
        />
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <WalletHeader />

        {isAutoMinting && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-black uppercase text-white">
              Estampando Sello...
            </h2>
          </div>
        )}

        <main className="mt-2 pb-24 px-4 overflow-y-auto flex-1">
          {activeTab === "pasaporte" && (
            <PasaporteView
              onStampClick={(sello) => {
                setSelectedSello(sello);
                setActiveTab("momentos");
              }}
            />
          )}
          {activeTab === "momentos" && (
            <MomentosView
              selectedSello={selectedSello}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "tienda" && <TiendaView />}
          {activeTab === "comunidad" && <ComunidadView />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

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
