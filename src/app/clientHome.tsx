"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSearchParams, useRouter } from "next/navigation";
import FarcasterLoader from "@/components/farcasterLoader";
import sdk from "@farcaster/frame-sdk";
import { MapPin, Lock, Loader2 } from "lucide-react";

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

// 🟢 CREAMOS UN COMPONENTE INTERNO PARA LEER LA URL
function HomeContent() {
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAutoMinting, setIsAutoMinting] = useState(false);

  // Leemos si la URL trae el mensaje oculto (ej: ?sello=guatape)
  const selloPendiente = searchParams.get("sello");

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) sdk.actions.ready();
  }, []);

  // 🪄 LA MAGIA: Si hay sello pendiente y el usuario ya se logueó, minteamos automático
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
          // Borramos el ?sello=guatape de la URL para que no lo vuelva a mintear si recarga la página
          router.replace("/", { scroll: false });
        }
      }
    };

    autoMint();
  }, [selloPendiente, authenticated, wallets, isAutoMinting, router]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      <FarcasterLoader />

      {/* PANTALLA DE CARGA MIENTRAS MINTEA AUTOMÁTICAMENTE */}
      {isAutoMinting && (
        <div className="fixed inset-0 z-index[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
          <h2 className="text-2xl font-black uppercase">
            Estampando tu sello...
          </h2>
          <p className="text-zinc-400">
            Por favor espera, guardando en la blockchain.
          </p>
        </div>
      )}

      {/* SECCIÓN DEL MAPA */}
      <section className="relative h-[45vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Mapa />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-purple-400 z-index-[400]">
          Explora Antioquia 📍
        </div>
      </section>

      {/* SECCIÓN DE MI PASAPORTE DIGITAL */}
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

        {/* SI TIENE UN SELLO PENDIENTE PERO NO ESTÁ LOGUEADO */}
        {selloPendiente && !authenticated ? (
          <div className="p-12 bg-purple-900/20 border-2 border-purple-500 rounded-3xl text-center space-y-6 animate-pulse">
            <h3 className="text-2xl font-black text-purple-400">
              ¡Tienes un sello de {selloPendiente} esperando!
            </h3>
            <p className="text-zinc-300">
              Inicia sesión para guardarlo en tu pasaporte.
            </p>
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
            <p className="text-zinc-400 font-medium">
              Inicia sesión para abrir tu pasaporte y coleccionar tus momentos.
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
                className={`aspec-[3/4] rounded-3xl border-2 flex flex-col p-6 relative overflow-hidden transition-all ${espacio.descubierto ? "border-purple-500 bg-zinc-900" : "border-zinc-800 bg-black border-dashed"}`}
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
                        className="w-32 h-32 rounded-full object-cover shadow-[0_0_20px_rgba(129,98,243,0.3)] mb-4"
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
    </main>
  );
}

// Envolvemos todo en Suspense porque usamos useSearchParams (Regla de Next.js)
export default function ClientHome() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}

/*"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import FarcasterLoader from "@/components/farcasterLoader";
import sdk from "@farcaster/frame-sdk";
import { MapPin, Lock } from "lucide-react";

// El mapa se carga dinámicamente
const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full bg-zinc-900 animate-pulse rounded-3xl" />
  ),
});

// Los 4 espacios de tu pasaporte
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

export default function ClientHome() {
  const { login, authenticated, user } = usePrivy();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sdk?.actions?.ready) sdk.actions.ready();
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a] text-white">
      <FarcasterLoader />

      {/* SECCIÓN DEL MAPA }
      <section className="relative h-[45vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Mapa />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-purple-400 z-index[400]">
          Explora Antioquia 📍
        </div>
      </section>

      {/* SECCIÓN DE MI PASAPORTE DIGITAL }
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

        {!authenticated ? (
          <div className="p-12 bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl text-center space-y-6">
            <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">
              Inicia sesión para abrir tu pasaporte y coleccionar tus momentos.
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
                className={`aspec-[3/4] rounded-3xl border-2 flex flex-col p-6 relative overflow-hidden transition-all ${espacio.descubierto ? "border-purple-500 bg-zinc-900" : "border-zinc-800 bg-black border-dashed"}`}
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
                        className="w-32 h-32 rounded-full object-cover shadow-[0_0_20px_rgba(129,98,243,0.3)] mb-4"
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
    </main>
  );
}*/
