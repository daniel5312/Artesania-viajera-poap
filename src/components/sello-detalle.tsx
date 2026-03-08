"use client";
import { useState, useRef } from "react";
import { Camera, Loader2, CheckCircle2, Globe } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { parseAbi } from "viem";
import { celo, celoSepolia } from "viem/chains"; // 🟢 1. Importamos las dos redes
import imageCompression from "browser-image-compression";
import { REGISTRY_CONTRACT } from "@/constants/contracts";

// 🟢 2. INTERRUPTOR MAESTRO: Cambia 'celo' por 'celoSepolia' para volver a pruebas
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
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
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
      // 🟢 3. Usamos el interruptor dinámico
      await switchChainAsync({ chainId: ACTIVE_CHAIN.id });

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

        <button
          onClick={() => {
            onBack();
            if (onNavigate) onNavigate("comunidad");
          }}
          className="mt-2 w-full bg-linear-to-r from-primary to-accent text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg flex justify-center gap-2 items-center hover:scale-[1.02] transition-transform"
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
