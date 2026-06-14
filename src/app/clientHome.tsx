"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import sdk from "@farcaster/frame-sdk";
import { Loader2 } from "lucide-react";

// Componentes del nuevo diseño
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import { useGlobal } from "@/lib/global-context";
import { WalletHeader } from "@/components/wallet-header";
import { BottomNav } from "@/components/bottom-nav";
import { PasaporteView } from "@/components/pasaporte-view";
import { TiendaView } from "@/components/tienda-view";
import { ComunidadView } from "@/components/comunidad-view";
import { MomentosView } from "@/components/momentos-view";
import { CollectionView } from "@/components/collection-view";
import { DashboardWalletView } from "@/components/dashboard-wallet-view";
import { ImpactDashboard } from "@/components/impact-dashboard";
import FarcasterLoader from "@/components/farcasterLoader";

type Tab = "pasaporte" | "tienda" | "comunidad" | "momentos" | "coleccion" | "dashboard" | "impacto";

function AppShell() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Traemos el contexto del nuevo tema
  const { isDarkMode } = useTheme();
  const { userRole, setUserRole } = useGlobal();

  const [mounted, setMounted] = useState(false);
  const [isAutoMinting, setIsAutoMinting] = useState(false);
  
  // Si es artesano, el home es el dashboard. Si es turista, el pasaporte.
  const [activeTab, setActiveTab] = useState<Tab>(userRole === "artesano" ? "dashboard" : "pasaporte");

  // Efecto para actualizar la pestaña si el rol cambia después del montaje
  useEffect(() => {
    if (userRole === "artesano" && activeTab !== "dashboard" && activeTab !== "impacto" && activeTab !== "comunidad") {
      setActiveTab("dashboard");
    } else if (userRole === "turista" && activeTab !== "pasaporte" && activeTab !== "tienda" && activeTab !== "momentos" && activeTab !== "comunidad" && activeTab !== "coleccion") {
      setActiveTab("pasaporte");
    }
  }, [userRole]);

  const actionParam = searchParams.get("action");
  const idParam = searchParams.get("id");
  const simulateParam = searchParams.get("simulate") === "true";

  const [qrAction, setQrAction] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) sdk.actions.ready();
  }, []);

  // Guardar parámetros de URL en estado/sessionStorage para que sobrevivan al login
  useEffect(() => {
    if (actionParam && idParam) {
      setQrAction(actionParam);
      setQrId(idParam);
      sessionStorage.setItem("qr_action", actionParam);
      sessionStorage.setItem("qr_id", idParam);
      
      // Limpiar URL visualmente
      router.replace("/", { scroll: false });
    } else {
      const savedAction = sessionStorage.getItem("qr_action");
      const savedId = sessionStorage.getItem("qr_id");
      if (savedAction && savedId) {
        setQrAction(savedAction);
        setQrId(savedId);
      }
    }
  }, [actionParam, idParam, router]);

  // 🪄 MÁQUINA DE ESTADOS: AUTO-MINTEO POST-LOGIN
  useEffect(() => {
    const autoMint = async () => {
      if (qrAction && qrId && authenticated && wallets.length > 0 && !isAutoMinting) {
        setIsAutoMinting(true);
        const wallet = wallets[0];

        try {
          console.log(`Minteando automáticamente ${qrAction} para ID: ${qrId}...`);

          const endpoint = qrAction === "claim_passport" ? "/api/mint-passport" : "/api/mint-badge";
          const body = qrAction === "claim_passport" 
            ? { recipient: wallet.address, puebloId: qrId }
            : { recipient: wallet.address, badgeId: qrId }; // En MVP pasamos el ID del artesano como badge

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            if (data.status === "already_claimed") {
              alert(`¡Ups! Ya tienes este sello en tu colección. No puedes reclamarlo dos veces.`);
            } else {
              alert(`¡Magia! 🪄 Has recibido un regalo exclusivo en tu pasaporte.`);
            }
          } else {
            alert(`Aviso: Este sello ya está en tu colección o hubo un error de red.`);
          }
        } catch (error) {
          console.error("Error en auto-mint:", error);
        } finally {
          setIsAutoMinting(false);
          setQrAction(null);
          setQrId(null);
          sessionStorage.removeItem("qr_action");
          sessionStorage.removeItem("qr_id");
          
          if (userRole === "turista") setActiveTab("pasaporte");
        }
      }
    };

    autoMint();
  }, [qrAction, qrId, authenticated, wallets, isAutoMinting, userRole]);

  if (!mounted) return null;

  // ESTADO PREVIEW (Aviso si hay QR pero no está logueado, o si forzamos la simulación)
  const isSimulatingPreview = simulateParam && qrAction && qrId;
  if ((qrAction && qrId && !authenticated) || isSimulatingPreview) {
    return (
      <div className={`mx-auto min-h-screen max-w-md relative overflow-hidden bg-background text-foreground flex flex-col items-center justify-center p-6 ${isDarkMode ? "dark" : ""}`}>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-background to-background"></div>
        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 mb-6 rounded-3xl bg-primary/20 border-2 border-primary/50 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center animate-pulse">
            <span className="text-4xl">🎁</span>
          </div>
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">¡Regalo Desbloqueado!</h1>
          <p className="text-sm opacity-80 mb-8 max-w-[250px]">
            {qrAction === "claim_passport" 
              ? `Estás a punto de recibir el Pasaporte Oficial de ${qrId.toUpperCase()}.`
              : `Has desbloqueado el NFT Único de este Artesano.`}
            <br/><br/>
            Conéctate con tu billetera para guardarlo para siempre.
          </p>
          <button 
            onClick={() => {
              if (isSimulatingPreview) {
                // Removemos el parámetro 'simulate' para que el useEffect de automint se dispare normalmente con la sesión actual
                window.location.href = window.location.pathname + "?action=" + qrAction + "&id=" + qrId;
              } else {
                login();
              }
            }} 
            className="w-full py-4 bg-primary text-white font-black text-lg uppercase rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            Conectar Billetera
          </button>
        </div>
      </div>
    );
  }

  if (authenticated && userRole === null) {
    return (
      <div className={`mx-auto min-h-screen max-w-md relative overflow-hidden bg-background text-foreground flex flex-col items-center justify-center p-6 ${isDarkMode ? "dark" : ""}`}>
        <h1 className="text-2xl font-black mb-2 text-center">¡Bienvenido a Artesanía Viajera!</h1>
        <p className="text-sm text-center mb-8 opacity-70">Para personalizar tu experiencia, cuéntanos cómo vas a usar la aplicación.</p>
        
        <div className="flex flex-col gap-4 w-full">
          <button onClick={() => setUserRole("turista")} className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center gap-3 text-center active:scale-95">
            <span className="text-4xl">🌍</span>
            <span className="font-bold text-lg">Soy Turista</span>
            <span className="text-xs opacity-70">Quiero comprar artesanías y coleccionar sellos.</span>
          </button>
          
          <button onClick={() => setUserRole("artesano")} className="p-6 rounded-2xl border-2 border-[#5FF5B4]/20 bg-[#5FF5B4]/5 hover:bg-[#5FF5B4]/10 transition-colors flex flex-col items-center gap-3 text-center active:scale-95">
            <span className="text-4xl">🎨</span>
            <span className="font-bold text-lg">Soy Artesano</span>
            <span className="text-xs opacity-70">Quiero cobrar, ver mis métricas y regalar sellos.</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto min-h-screen max-w-md relative overflow-hidden bg-background text-foreground transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}
    >
      <FarcasterLoader />

      {/* HEADER INTELIGENTE CON PRIVY */}
      <WalletHeader />

      {/* OVERLAY DE CARGA DEL QR */}
      {isAutoMinting && (
        <div className="absolute inset-0 z-index[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-black uppercase text-foreground">
            Estampando Sello...
          </h2>
        </div>
      )}

      {/* VISTAS DINÁMICAS */}
      <main className="mt-2 pb-24">
        {activeTab === "pasaporte" && (
          <PasaporteView
            onStampClick={function (sello: any): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}
        {activeTab === "tienda" && <TiendaView onNavigate={setActiveTab} />}
        {activeTab === "coleccion" && <CollectionView />}
        {activeTab === "momentos" && <MomentosView selectedSello={undefined} />}
        {activeTab === "comunidad" && <ComunidadView />}
        {activeTab === "dashboard" && <DashboardWalletView onNavigate={setActiveTab} />}
        {activeTab === "impacto" && <ImpactDashboard />}
      </main>

      {/* NAVEGACIÓN INFERIOR ESTILO APP */}
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
}
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
