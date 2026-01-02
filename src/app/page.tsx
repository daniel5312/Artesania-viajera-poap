"use client";
import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import FarcasterLoader from "@/components/farcasterLoader";

// dynamic: función de Next.js para cargar el mapa solo en el cliente (evita error de window is not defined)
const Mapa = dynamic(() => import("@/components/mapa"), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] w-full bg-zinc-900 animate-pulse rounded-3xl" />
  ),
});

export default function Home() {
  const { login, authenticated, user, logout } = usePrivy();

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a]">
      {/* Navbar: Estructura HTML5 con Flexbox de Tailwind */}
      <nav className="flex justify-between items-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-tighter bg-linear-to-r from-[#8162f3] to-[#eb527d] bg-clip-text text-transparent uppercase">
          Artesanía Viajera
        </h1>
        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
          {user?.wallet?.address}
        </p>
        <button
          onClick={authenticated ? logout : login}
          className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full font-bold hover:bg-zinc-800 transition-all text-sm"
        >
          {authenticated
            ? `Salir (${user?.email?.address?.slice(0, 6)})`
            : "Conectar"}
        </button>
      </nav>
      <FarcasterLoader />
      {/* Sección del Mapa: El contenedor usa z-index relativo para Leaflet */}
      <section className="relative h-[55vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Mapa />
      </section>

      {/* Footer / Hero Text */}
      <div className="text-center space-y-4 py-10">
        <h2 className="text-5xl font-bold italic tracking-tighter uppercase">
          Explora el Arte Vivo
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto text-lg">
          Verifica tu identidad con{" "}
          <span className="text-[#8162f3] font-mono">Self Protocol</span> y
          colecciona Badges en Celo.
        </p>
      </div>
    </main>
  );
}
// Fix para forzar el despliegue de Vercel para deplyo en producción
