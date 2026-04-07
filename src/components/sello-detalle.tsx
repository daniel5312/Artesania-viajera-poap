"use client";
import { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  CheckCircle2,
  Globe,
  ArrowLeft,
  FlaskConical,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import imageCompression from "browser-image-compression";
import { celo, celoSepolia } from "viem/chains";

// 🟢 EL INTERRUPTOR QUE TE GUSTA:
// Cambia esto a 'celoSepolia' cuando estés probando y a 'celo' para el despliegue real.
const ACTIVE_CHAIN = celo;

type TabType = "pasaporte" | "tienda" | "comunidad" | "momentos";

export function SelloDetalle({
  sello,
  onBack,
  onNavigate,
}: {
  sello: any;
  onBack: () => void;
  onNavigate?: (tab: TabType) => void;
}) {
  const { user, authenticated, login } = usePrivy();
  const address = user?.wallet?.address;

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGuardarMomento = async () => {
    if (!authenticated) return login();
    if (!address) return alert("🚨 No hay wallet vinculada.");
    if (!fotoPreview) return alert("📸 Falta la foto.");

    setProcesando(true);
    try {
      // 1. Compresión
      const reader = new FileReader();
      const imageFile = await fetch(fotoPreview)
        .then((r) => r.blob())
        .then((blob) => new File([blob], "foto.jpg", { type: "image/jpeg" }));
      const compressedFile = await imageCompression(imageFile, {
        maxSizeMB: 0.8,
      });

      // 2. Subida a Pinata
      const formData = new FormData();
      formData.append("file", compressedFile);
      const resUpload = await fetch("/api/upload-moment", {
        method: "POST",
        body: formData,
      });
      const dataUpload = await resUpload.json();

      // 3. 🤖 LLAMADO AL ROBOT DINÁMICO
      const resRegister = await fetch("/api/register-moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: address,
          puebloId: sello.puebloId,
          cid: dataUpload.ipfsUrl,
          // 👈 LE PASAMOS EL ID DE LA RED AL BACKEND
          chainId: ACTIVE_CHAIN.id,
        }),
      });

      const dataRegister = await resRegister.json();
      if (!dataRegister.success) throw new Error(dataRegister.error);

      setIsConfirmed(true);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      {/* INDICADOR DE RED (Para que no se te olvide en qué estás) */}
      <div className="flex items-center justify-center gap-2">
        {ACTIVE_CHAIN.id === 42220 ? (
          <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-600 px-2 py-1 rounded-full font-bold uppercase">
            <FlaskConical size={12} /> Testnet Sepolia
          </span>
        ) : (
          <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-1 rounded-full font-bold uppercase">
            Mainnet
          </span>
        )}
      </div>

      {/* ... (Todo el resto del JSX que ya teníamos del post anterior) ... */}
      <button
        onClick={handleGuardarMomento}
        disabled={!fotoPreview || procesando}
        className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl"
      >
        {procesando ? "Robot trabajando..." : "🚀 Publicar (Gasless)"}
      </button>
    </div>
  );
}
/*"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // 🟢 1. Importamos el enrutador
import { Camera, Loader2, CheckCircle2, Globe } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { parseAbi } from "viem";
import imageCompression from "browser-image-compression";
import { REGISTRY_CONTRACT } from "@/constants/contracts";

export function SelloDetalle({
  sello,
  onBack,
  onNavigate,
}: {
  sello: any;
  onBack: () => void;
  onNavigate?: (tab: any) => void;
}) {
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const router = useRouter(); // 🟢 2. Inicializamos el enrutador
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: "image/jpeg" });
  };

  const handleGuardarMomento = async () => {
    if (!address) return alert("🚨 Billetera no conectada.");
    if (!fotoPreview) return alert("📸 Selecciona una foto.");

    setProcesando(true);
    try {
      //await switchChainAsync({ chainId: 11142220 });
      await switchChainAsync({ chainId: 42220 });
      const imageFile = base64ToFile(fotoPreview, "momento.jpg");
      const compressedFile = await imageCompression(imageFile, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);
      const res = await fetch("/api/upload-moment", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      writeContract({
        address: REGISTRY_CONTRACT.address,
        abi: parseAbi([
          "function registrarMomento(string _puebloId, string _cid)",
        ]),
        functionName: "registrarMomento",
        args: [sello.puebloId, data.ipfsUrl],
      });
    } catch (error: any) {
      alert(error.message || "Error técnico");
    } finally {
      setProcesando(false);
    }
  };

  const isWorking = procesando || isPending || isConfirming;

  if (isConfirmed) {
    return (
      <div className="py-10 flex flex-col items-center gap-5 text-center">
        <CheckCircle2
          size={70}
          className="text-green-500 animate-bounce drop-shadow-lg"
        />
        <div>
          <h3 className="font-black text-xl tracking-tight">
            ¡Mural Actualizado!
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase mt-1">
            Tu memoria ya está en la blockchain de Celo.
          </p>
        </div>

        {/* 🟢 3. Botón para ir al mural global *}
        <button
          onClick={() => {
            onBack();
            // Cambia "/comunidad" por la ruta real si tu app usa otra (ej. "/" o "?tab=comunidad")
            if (onNavigate) onNavigate("comunidad"); // Cambia la pestaña a Comunidad
          }}
          className="mt-2 w-full bg-gradien-to-r from-primary to-accent text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg flex justify-center gap-2 items-center hover:scale-[1.02] transition-transform"
        >
          <Globe size={18} /> Ver en el Mural Global
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-sm font-bold mb-4 uppercase italic">
        Recuerdo en {sello.name}
      </h3>
      <div
        onClick={() => !isWorking && fileInputRef.current?.click()}
        className="relative aspect-square w-full max-w-200px mx-auto mb-6 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner"
      >
        {fotoPreview ? (
          <img src={fotoPreview} className="w-full h-full object-cover" />
        ) : (
          <Camera size={40} className="text-primary/40" />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result)
                setFotoPreview(event.target.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <button
        onClick={handleGuardarMomento}
        disabled={!fotoPreview || isWorking}
        className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg disabled:opacity-50 flex justify-center gap-2"
      >
        {isWorking ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          "🚀 Subir Foto al Mural"
        )}
      </button>
    </div>
  );
}*/
