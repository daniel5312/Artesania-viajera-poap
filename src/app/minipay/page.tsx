"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import sdk from "@farcaster/frame-sdk";
import { Loader2 } from "lucide-react";

// Componentes del nuevo diseño ligero
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { WalletHeader } from "@/components/wallet-header";
import { BottomNav } from "@/components/bottom-nav";
import { PasaporteView } from "@/components/pasaporte-view";
import { TiendaView } from "@/components/tienda-view";
import { ComunidadView } from "@/components/comunidad-view";
import { MomentosView } from "@/components/momentos-view";
import FarcasterLoader from "@/components/farcasterLoader";

type Tab = "pasaporte" | "tienda" | "comunidad" | "momentos";

function AppShell() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const [mounted, setMounted] = useState(false);
  const [isAutoMinting, setIsAutoMinting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("pasaporte");

  const selloPendiente = searchParams.get("sello");

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) sdk.actions.ready();
  }, []);

  // 🪄 LA MAGIA DEL QR FÍSICO (Auto-minteo)
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
          console.log(
            `Minteando automáticamente el sello de ${selloPendiente}...`,
          );

          const response = await fetch("/api/mint-passport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: wallet.address,
              tipo: `Sello ${selloPendiente}`,
            }),
          });

          if (response.ok) {
            alert(
              `¡Magia! 🪄 El sello de ${selloPendiente} ha sido añadido a tu pasaporte.`,
            );
          }
        } catch (error) {
          console.error("Error en auto-mint:", error);
        } finally {
          setIsAutoMinting(false);
          // 🟢 CORRECCIÓN: Redirigimos a la raíz "/" para limpiar la URL del QR en Mainnet
          router.replace("/", { scroll: false });
        }
      }
    };

    autoMint();
  }, [selloPendiente, authenticated, wallets, isAutoMinting, router]);

  if (!mounted) return null;

  return (
    <div
      className={`mx-auto min-h-screen max-w-md relative overflow-hidden bg-background text-foreground transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}
    >
      <FarcasterLoader />

      <WalletHeader />

      {isAutoMinting && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-black uppercase text-foreground">
            Estampando Sello...
          </h2>
        </div>
      )}

      {selloPendiente && !authenticated && (
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-center animate-pulse">
          <p className="text-sm font-bold text-primary mb-2">
            ¡Tienes un sello de {selloPendiente} esperando!
          </p>
          <button
            onClick={login}
            className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
          >
            Conectar para reclamar
          </button>
        </div>
      )}

      <main className="mt-2 pb-24">
        {activeTab === "pasaporte" && (
          <PasaporteView onNavigate={setActiveTab} />
        )}
        {activeTab === "tienda" && <TiendaView />}
        {activeTab === "momentos" && <MomentosView />}
        {activeTab === "comunidad" && <ComunidadView />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function MiniPayPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AppShell />
      </Suspense>
    </ThemeProvider>
  );
}
