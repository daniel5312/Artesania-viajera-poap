// front/src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { ShoppingCart, Menu } from "lucide-react";

export default function Navbar() {
  const { authenticated, login, logout, user } = usePrivy();

  return (
    <nav className="w-full bg-zinc-950 border-b border-zinc-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-black">
              AV
            </div>
            <span className="font-bold text-xl tracking-tighter">
              Artesanía Viajera
            </span>
          </Link>

          {/* LINKS ESCRITORIO */}
          <div className="hidden md:flex space-x-8 items-center text-sm font-medium text-zinc-300">
            <Link
              href="/pitch"
              className="hover:text-purple-400 transition-colors"
            >
              Pitch Deck
            </Link>
            <Link
              href="/tienda"
              className="hover:text-purple-400 transition-colors"
            >
              Tienda
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-purple-400 transition-colors"
            >
              Mi Pasaporte
            </Link>
            <Link
              href="/blog"
              className="hover:text-purple-400 transition-colors"
            >
              Relatos
            </Link>
          </div>

          {/* ACCIONES (Carrito + Login) */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <ShoppingCart size={20} />
              <span className="absolute top-0 right-0 bg-purple-600 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {authenticated ? (
              <button
                onClick={logout}
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-bold border border-zinc-700"
              >
                {user?.wallet?.address?.slice(0, 6)}...
              </button>
            ) : (
              <button
                onClick={login}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200"
              >
                Conectar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
