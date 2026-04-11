/*"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import sdk from "@farcaster/frame-sdk";
import { Loader2 } from "lucide-react";

// Componentes del nuevo diseño
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
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Traemos el contexto del nuevo tema
  const { isDarkMode } = useTheme();

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

      {/* HEADER INTELIGENTE CON PRIVY }
      <WalletHeader />

      {/* OVERLAY DE CARGA DEL QR }
      {isAutoMinting && (
        <div className="absolute inset-0 z-index[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-black uppercase text-foreground">
            Estampando Sello...
          </h2>
        </div>
      )}

      {/* AVISO SI HAY QR PERO NO ESTÁ LOGUEADO }
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

      {/* VISTAS DINÁMICAS }
      <main className="mt-2 pb-24">
        {activeTab === "pasaporte" && <PasaporteView />}
        {activeTab === "tienda" && <TiendaView />}
        {activeTab === "momentos" && <MomentosView />}
        {activeTab === "comunidad" && <ComunidadView />}
      </main>

      {/* NAVEGACIÓN INFERIOR ESTILO APP }
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// Envolvemos todo en ThemeProvider (Diseño) y Suspense (Lectura de URL)
export default function ClientHome() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AppShell />
      </Suspense>
    </ThemeProvider>
  );
}*/
/*"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSearchParams, useRouter } from "next/navigation";
import FarcasterLoader from "@/components/farcasterLoader";
import sdk from "@farcaster/frame-sdk";
import { MapPin, Lock, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-zinc-900 animate-pulse rounded-3xl" />
  ),
});

const ESPACIOS_PASAPORTE = [
  {
    id: 1,
    municipio: "Guatapé",
    descubierto: true,
    imagen: "https://placehold.co/400x400/8162f3/white?text=Guatape",
  },
  { id: 2, municipio: "Santa Fe de Antioquia", descubierto: false, imagen: "" },
  { id: 3, municipio: "Jericó", descubierto: false, imagen: "" },
  { id: 4, municipio: "Jardín", descubierto: false, imagen: "" },
];

function HomeContent() {
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [mounted, setMounted] = useState(false);
  const [isAutoMinting, setIsAutoMinting] = useState(false);
  const selloPendiente = searchParams.get("sello");

  useEffect(() => {
    if (isMobile) {
      router.replace("/minipay", { scroll: false });
    }
  }, [isMobile, router]);

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) sdk.actions.ready();
  }, []);

  useEffect(() => {
    const autoMint = async () => {
      const addressSegura = user?.wallet?.address || wallets?.[0]?.address;

      if (
        selloPendiente &&
        authenticated &&
        addressSegura?.startsWith("0x") &&
        !isAutoMinting
      ) {
        setIsAutoMinting(true);
        try {
          const response = await fetch("/api/mint-passport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: addressSegura,
              puebloId: selloPendiente,
            }),
          });
          if (response.ok)
            alert(
              `¡Magia! 🪄 El sello de ${selloPendiente} ha sido añadido a tu pasaporte.`,
            );
        } catch (error) {
          console.error("Error en auto-mint:", error);
        } finally {
          setIsAutoMinting(false);
          router.replace("/", { scroll: false });
        }
      }
    };
    autoMint();
  }, [selloPendiente, authenticated, user, wallets, isAutoMinting, router]);

  if (!mounted || isMobile) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 w-full bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <FarcasterLoader />

        {isAutoMinting && (
          <div className="fixed inset-0 z-9999 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
            <h2 className="text-2xl font-black uppercase">
              Estampando tu sello...
            </h2>
          </div>
        )}

        <section className="relative h-[45vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
          <Mapa />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              Mi Pasaporte Digital
            </h2>
            <p className="text-zinc-500 text-sm">
              {authenticated
                ? `Colección digital de ${user?.wallet?.address?.slice(0, 6)}...`
                : "Tus recuerdos irrefutables en la blockchain de Celo."}
            </p>
          </div>

          {selloPendiente && !authenticated ? (
            <div className="p-12 bg-purple-900/20 border-2 border-purple-500 rounded-3xl text-center space-y-6 animate-pulse">
              <h3 className="text-2xl font-black text-purple-400">
                ¡Tienes un sello de {selloPendiente} esperando!
              </h3>
              <button
                onClick={login}
                className="px-10 py-4 bg-purple-600 rounded-full font-black uppercase text-sm hover:scale-105 transition-transform text-white"
              >
                Conectar y Reclamar
              </button>
            </div>
          ) : !authenticated ? (
            <div className="p-12 bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl text-center space-y-6">
              <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium mb-4">
                Inicia sesión para abrir tu pasaporte y coleccionar tus
                momentos.
              </p>
              <button
                onClick={login}
                className="px-10 py-4 bg-purple-600 rounded-full font-black uppercase text-sm hover:scale-105 transition-transform text-white"
              >
                Abrir mi Pasaporte
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ESPACIOS_PASAPORTE.map((espacio) => (
                <div
                  key={espacio.id}
                  className={`aspect-3/4 rounded-3xl border-2 flex flex-col p-6 relative overflow-hidden transition-all ${espacio.descubierto ? "border-purple-500 bg-zinc-900" : "border-zinc-800 bg-black border-dashed"}`}
                >
                  {espacio.descubierto ? (
                    <>
                      <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                        SELLADO
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <img
                          src={espacio.imagen}
                          alt={espacio.municipio}
                          className="w-32 h-32 rounded-full object-cover mb-4 shadow-[0_0_20px_rgba(129,98,243,0.3)]"
                        />
                        <h3 className="font-bold text-lg text-center">
                          {espacio.municipio}
                        </h3>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                      <div className="w-24 h-24 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                        <MapPin size={24} />
                      </div>
                      <h3 className="font-bold text-center text-zinc-500">
                        Espacio Vacío
                      </h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ClientHome() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <HomeContent />
    </Suspense>
  );
}*/
