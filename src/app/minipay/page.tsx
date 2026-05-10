"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useAccount, useConnect, useConnectors } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2, X } from "lucide-react";

import dynamic from "next/dynamic";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { useGlobal, GlobalProvider } from "@/lib/global-context";
import { UbiFlowProvider } from "@/lib/ubi-flow-context";
import { WalletHeader } from "@/components/wallet-header";
import { BottomNav } from "@/components/bottom-nav";
import { LandingView } from "@/components/landing-view";

const PasaporteView = dynamic(() => import("@/components/pasaporte-view").then(m => m.PasaporteView), { ssr: false });
const TiendaView = dynamic(() => import("@/components/tienda-view").then(m => m.TiendaView), { ssr: false });
const ComunidadView = dynamic(() => import("@/components/comunidad-view").then(m => m.ComunidadView), { ssr: false });
const MomentosView = dynamic(() => import("@/components/momentos-view").then(m => m.MomentosView), { ssr: false });
const CollectionView = dynamic(() => import("@/components/collection-view").then(m => m.CollectionView), { ssr: false });
const DashboardWalletView = dynamic(() => import("@/components/dashboard-wallet-view").then(m => m.DashboardWalletView), { ssr: false });
const ImpactDashboard = dynamic(() => import("@/components/impact-dashboard").then(m => m.ImpactDashboard), { ssr: false });

type Tab = "pasaporte" | "tienda" | "comunidad" | "momentos" | "coleccion" | "dashboard" | "impacto";

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
  const { userRole } = useGlobal();

  const [mounted, setMounted] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isAutoMinting, setIsAutoMinting] = useState(false);
  // Artisans land on dashboard; tourists land on pasaporte
  const [activeTab, setActiveTab] = useState<Tab>(userRole === "artesano" ? "dashboard" : "pasaporte");

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
    // Show app if connected AND role is chosen, or if there's a pending stamp
    if ((isConnected && userRole) || selloPendiente) {
      setShowLanding(false);
    } else {
      setShowLanding(true);
    }
  }, [isConnected, userRole, selloPendiente]);

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
      className={`mx-auto min-h-screen max-w-md relative overflow-hidden transition-colors duration-500 ${isDarkMode ? "bg-[#050505] text-[#e2e2df]" : "bg-[#f2efeb] text-[#0d0d0c]"}`}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Subtle noise */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" style={{ backgroundSize: "180px" }} />
        {/* NEAR-style mint radial glow — top right */}
        <div className={`absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px] transition-opacity duration-1000 ${isDarkMode ? "bg-[#5FF5B4]/10 opacity-100" : "bg-[#00c27b]/8 opacity-60"}`} />
        {/* Soft glow bottom left */}
        <div className={`absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-[120px] ${isDarkMode ? "bg-[#5FF5B4]/5" : "bg-[#00c27b]/5"}`} />
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
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "momentos" && (
            <MomentosView
              selectedSello={selectedSello}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "tienda" && <TiendaView onNavigate={setActiveTab} />}
          {activeTab === "coleccion" && <CollectionView />}
          {activeTab === "comunidad" && <ComunidadView />}
          {activeTab === "dashboard" && <DashboardWalletView onNavigate={setActiveTab} />}
          {activeTab === "impacto" && <ImpactDashboard onNavigate={setActiveTab} />}
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
    <GlobalProvider>
      <UbiFlowProvider>
        <ThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-[#0F0A1F]" />}>
            <AppShell />
          </Suspense>
        </ThemeProvider>
      </UbiFlowProvider>
    </GlobalProvider>
  );
}
