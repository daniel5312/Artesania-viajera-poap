/*"use client";
import ReclamarSello from "@/components/reclamarSello";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReclamarPage({
  params,
}: {
  params: Promise<{ municipio: string }>;
}) {
  // Desempaquetamos el parámetro de la URL (ej: "santa-fe")
  const { municipio } = use(params);

  // Arreglamos el texto para que se vea bonito (ej: "santa-fe" -> "Santa Fe")
  const nombreLimpio = municipio
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Generamos una imagen de prueba basada en el municipio
  const imagenPrueba = `https://placehold.co/400x400/8162f3/white?text=${municipio}`;

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Volver al mapa</span>
        </Link>
      </div>

      <div className="w-full">
        {/* 🟢 AQUÍ INVOCAMOS LA MÁQUINA DE SELLAR QUE CREASTE *}
        <ReclamarSello municipio={nombreLimpio} imagenSello={imagenPrueba} />
      </div>
    </main>
  );
}*/
