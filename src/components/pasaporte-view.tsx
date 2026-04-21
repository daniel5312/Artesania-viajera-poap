"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { IdentitySDK } from "@goodsdks/citizen-sdk";
import { createPublicClient, http, stringToHex } from "viem";
import { celo } from "viem/chains";
import { PASSPORT_CONTRACT } from "@/constants/contracts";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Stamp,
  QrCode,
  UserCheck,
  Fingerprint,
  Coins,
} from "lucide-react";

const MapaReal = dynamic(() => import("@/components/mapa"), { ssr: false });
const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const PUEBLOS_DEMO = [
  { id: "guatape_socalos", name: "Guatapé" },
  { id: "sombrillas_guatape", name: "Sombrillas" },
];

export function PasaporteView({
  onStampClick,
}: {
  onStampClick: (sello: any) => void;
}) {
  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");

  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user, authenticated: authPrivy, login } = usePrivy();
  const { wallets } = useWallets();

  const authenticated = isMiniPayRoute ? authWagmi : authPrivy;
  const userAddress = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const [identitySDK, setIdentitySDK] = useState<any>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [fvLink, setFvLink] = useState<string | null>(null);

  const [sellos, setSellos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [simulando, setSimulando] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 15;

  const checkIdentity = async () => {
    if (!userAddress) return;
    setCargando(true);
    try {
      let sdk = identitySDK;
      if (!sdk) {
        sdk = new IdentitySDK({
          env: "production",
          account: userAddress as `0x${string}`,
          publicClient: publicClient as any,
          walletClient: {
            account: { address: userAddress },
            chain: celo,
            signMessage: async ({ message }: any) => {
              const msgToSign = typeof message === 'string' ? message : message.raw || message;
              const hexMsg = typeof msgToSign === 'string' && msgToSign.startsWith('0x') ? msgToSign : stringToHex(msgToSign);
              if (isMiniPayRoute) {
                 return await signMessageAsync({ message: msgToSign });
              } else {
                 const wallet = wallets.find(w => w.address === userAddress) || wallets[0];
                 if (!wallet) throw new Error("No wallet found to sign");
                 const provider = await wallet.getEthereumProvider();
                 return await provider.request({ method: 'personal_sign', params: [hexMsg, userAddress] });
              }
            }
          } as any,
        });
        setIdentitySDK(sdk);
      }

      const result = await sdk.getWhitelistedRoot(userAddress);
      setIsWhitelisted(result.isWhitelisted);

      if (!result.isWhitelisted) {
        const link = await sdk.generateFVLink(
          false,
          window.location.href,
          42220,
        );
        setFvLink(link);
      }
    } catch (e) {
      console.error("Error checking identity:", e);
    } finally {
      setCargando(false);
    }
  };

  const leerPasaporte = useCallback(async () => {
    const walletAddress = userAddress;
    if (!authenticated || !walletAddress) return;
    setCargando(true);
    try {
      // Usamos multicall para los primeros 100 IDs (ajustar si manejas miles)
      const ids = Array.from({ length: 100 }, (_, i) => BigInt(i));
      const owners = await publicClient.multicall({
        contracts: ids.map((id) => ({
          ...PASSPORT_CONTRACT,
          address: PASSPORT_CONTRACT.address as `0x${string}`,
          functionName: "ownerOf",
          args: [id],
        })),
        allowFailure: true,
      });

      // 🟢 FIX APLICADO AQUÍ: Comparación segura ignorando el Checksum
      const misIds = ids.filter((_, i) => {
        if (owners[i].status !== "success") return false;
        return (
          (owners[i].result as string).toLowerCase() ===
          walletAddress.toLowerCase()
        );
      });

      const uris = await publicClient.multicall({
        contracts: misIds.map((id) => ({
          ...PASSPORT_CONTRACT,
          address: PASSPORT_CONTRACT.address as `0x${string}`,
          functionName: "tokenURI",
          args: [id],
        })),
        allowFailure: true,
      });

      const gateway =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

      const nuevosSellos = (
        await Promise.all(
          uris.map(async (res, i) => {
            if (res.status !== "success") return null;
            try {
              const url = (res.result as string).replace(
                "ipfs://",
                `https://${gateway}/ipfs/`,
              );
              const metaRes = await fetch(url);
              const meta = await metaRes.json();
              return {
                ...meta,
                id: misIds[i].toString(),
                puebloId: meta.puebloId || "guatape_socalos",
                image: meta.image
                  ?.replace("ipfs://", `https://${gateway}/ipfs/`)
                  .replace(
                    "https://gateway.pinata.cloud/ipfs/",
                    `https://${gateway}/ipfs/`,
                  ),
              };
            } catch {
              return null;
            }
          }),
        )
      ).filter(Boolean);

      setSellos(nuevosSellos.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [authenticated, userAddress]);

  const handleSimularMint = async (puebloId: string) => {
    if (!authenticated) {
      if (!isMiniPayRoute) return login();
      else {
        alert("MiniPay no conectado. Refresca la página.");
        return;
      }
    }
    setSimulando(puebloId);
    try {
      const res = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: userAddress, puebloId }),
      });
      if (res.ok) {
        alert("¡Sello estampado por el Robot! 🤖");
        leerPasaporte();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulando(null);
    }
  };

  // Asegúrate de que el useEffect se dispare solo cuando cambie el usuario real
  useEffect(() => {
    if (authenticated && userAddress) {
      leerPasaporte();
    } else {
      setSellos([]); // 🟢 Limpiar sellos si no hay nadie logueado
    }
  }, [authenticated, userAddress, leerPasaporte]);

  return (
    <div className="flex flex-col gap-6 px-1 relative pb-24">
      {/* 🟢 SECCIÓN: Identidad GoodDollar */}
      {authenticated && userAddress && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-inner">
          {isWhitelisted === null ? (
            <button
              onClick={checkIdentity}
              disabled={cargando}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  <Fingerprint size={14} /> Verificar Identidad G$
                </>
              )}
            </button>
          ) : isWhitelisted ? (
            <>
              <div className="flex items-center gap-2 text-green-600 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                <UserCheck size={16} />
                <span className="text-[11px] font-black uppercase">
                  ✅ Humano Verificado (Identidad G$)
                </span>
              </div>
              <a
                href="https://wallet.gooddollar.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-md"
              >
                <Coins size={14} /> Reclamar UBI Diario
              </a>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1 text-center px-2">
                <p className="text-xs font-bold text-foreground">
                  Tu identidad aún no está verificada
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Debes verificar que eres un humano único para reclamar el UBI
                  y tener los beneficios completos.
                </p>
              </div>
              <a
                href={fvLink || "https://wallet.gooddollar.org/"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:opacity-90 transition-opacity"
              >
                <Fingerprint size={14} /> Obtener Sello G$
              </a>
            </>
          )}
        </div>
      )}

      <div className="h-60 w-full overflow-hidden rounded-[40px] border-4 border-card shadow-2xl z-0">
        <MapaReal />
      </div>
      <div className="bg-primary/10 border border-dashed border-primary/30 rounded-[30px] p-4 flex flex-col gap-3">
        <p className="text-[9px] font-black uppercase text-center text-primary flex items-center justify-center gap-2">
          <QrCode size={12} /> Simular Escaneo
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PUEBLOS_DEMO.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSimularMint(p.id)}
              disabled={simulando !== null}
              className="text-[8px] bg-background border border-primary/20 px-3 py-1.5 rounded-full font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
            >
              {simulando === p.id ? "Procesando..." : p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-primary/10 p-3 rounded-2xl border border-primary/20">
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
            <Stamp size={14} /> Sellos Coleccionados
          </span>
          <span className="text-xs font-medium text-foreground">
            {cargando ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              `${sellos.length} NFTs`
            )}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sellos
            .slice(
              (paginaActual - 1) * itemsPorPagina,
              paginaActual * itemsPorPagina,
            )
            .map((s) => (
              <div
                key={s.id}
                onClick={() => onStampClick(s)}
                className="bg-card rounded-xl overflow-hidden shadow-sm active:scale-95 cursor-pointer border border-primary/20 relative aspect-square group"
              >
                <img
                  src={s.image}
                  className="w-full h-full object-cover"
                  alt="Sello"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                  <p className="text-[7px] font-black uppercase text-white truncate text-center">
                    {s.name}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
