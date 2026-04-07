"use client";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth"; // 🟢 Usamos usePrivy directamente
import { MapPin, Loader2 } from "lucide-react";

interface ReclamarSelloProps {
  municipio: string; // Debe ser "guatape_socalos" o "sombrillas_guatape" para que el Robot lo encuentre
  imagenSello: string;
}

export default function ReclamarSello({
  municipio,
  imagenSello,
}: ReclamarSelloProps) {
  const { authenticated, login, user } = usePrivy(); // 🟢 Sacamos 'user' de aquí
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "minting" | "success">("idle");

  const reclamarNFT = async () => {
    if (!authenticated) return login();

    // 🟢 LA CLAVE: Sacamos la wallet directamente del usuario de Privy
    const address = user?.wallet?.address;

    if (!address) {
      return alert(
        "Error: No se encontró tu wallet de Privy. Intenta recargar.",
      );
    }

    setLoading(true);
    setStep("minting");

    try {
      // 🟢 Llamamos al Robot
      const response = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: address, // ✅ Ahora sí va el 0x...
          puebloId: municipio, // ✅ Cambiado de 'tipo' a 'puebloId' para que el Robot lo entienda
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep("success");
      } else {
        // Si el robot devuelve error, lo mostramos
        throw new Error(data.error || "Error en el minteo");
      }
    } catch (error: any) {
      console.error("Error al reclamar:", error);
      alert("Hubo un problema: " + error.message);
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  // ... (El resto de tu JSX de éxito e interfaz se queda igual)
  if (step === "success") {
    return (
      <div className="bg-green-900/20 border border-green-500 p-8 rounded-3xl text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-green-500">
          <img
            src={imagenSello}
            alt={municipio}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-2xl font-black text-green-400">
          ¡Sello Estampado! 🎊
        </h3>
        <p className="text-zinc-300 mt-2">Guardado en tu Pasaporte Digital.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6 text-center max-w-sm mx-auto">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_15px_rgba(129,98,243,0.5)]">
          <img
            src={imagenSello}
            alt={municipio}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-black">{municipio.replace("_", " ")}</h3>
        <p className="text-sm text-zinc-400 mt-2 flex items-center justify-center gap-1">
          <MapPin size={16} /> Estás a punto de agregar este sello.
        </p>
      </div>
      <button
        onClick={reclamarNFT}
        disabled={loading}
        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-wider hover:bg-purple-500 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Estampando...
          </>
        ) : (
          "Reclamar Sello"
        )}
      </button>
    </div>
  );
}
