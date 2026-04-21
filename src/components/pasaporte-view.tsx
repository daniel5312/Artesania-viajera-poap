import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useTheme } from "@/lib/theme-context";
import { IdentitySDK } from "@goodsdks/citizen-sdk";
import { createPublicClient, http, stringToHex } from "viem";
import { celo } from "viem/chains";
import { PASSPORT_CONTRACT } from "@/constants/contracts";
import {
  Loader2,
  UserCheck,
  Fingerprint,
  Coins,
  Stamp,
  QrCode
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
  const { isDarkMode, lang } = useTheme();

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

      const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";

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

  useEffect(() => {
    if (authenticated && userAddress) {
      leerPasaporte();
    } else {
      setSellos([]);
      setIsWhitelisted(null);
      setFvLink(null);
    }
  }, [authenticated, userAddress, leerPasaporte]);

  return (
    <div className="flex flex-col gap-6 px-1 relative pb-24">
      <header className="pt-4 text-center">
        <h2 className={`text-2xl font-black uppercase tracking-widest ${isDarkMode ? "text-white" : "text-primary"}`}>
          {lang === "es" ? "Pasaporte Digital" : "Digital Passport"}
        </h2>
        <p className={`text-[10px] font-medium uppercase tracking-widest mt-1 opacity-50`}>
          {lang === "es" ? "Identidad y Sellos de Ruta" : "Identity and Route Stamps"}
        </p>
      </header>

      {/* 🟢 SECCIÓN: Identidad GoodDollar */}
      {authenticated && userAddress && (
        <div className={`p-6 rounded-[2.5rem] border flex flex-col items-center justify-center gap-4 shadow-xl relative overflow-hidden ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-primary/20"}`}>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
          
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Fingerprint size={24} className="text-primary" />
            </div>
            <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">G$ Identity</h3>
                {isWhitelisted === null ? (
                    <button
                        onClick={checkIdentity}
                        disabled={cargando}
                        className="text-primary font-bold text-xs hover:underline disabled:opacity-50"
                    >
                        {cargando ? "Verificando..." : "Verificar ahora →"}
                    </button>
                ) : isWhitelisted ? (
                    <span className="text-emerald-500 font-black text-xs uppercase tracking-tight flex items-center gap-1">
                        <UserCheck size={14} /> Verified Human
                    </span>
                ) : (
                    <a href={fvLink || "#"} target="_blank" className="text-blue-500 font-bold text-xs">
                        Obtener Sello G$ →
                    </a>
                )}
            </div>
            {isWhitelisted && (
                <a href="https://wallet.gooddollar.org/" target="_blank" className="p-2 rounded-xl bg-primary text-white shadow-lg">
                    <Coins size={18} />
                </a>
            )}
          </div>
        </div>
      )}

      <div className="h-60 w-full overflow-hidden rounded-[3rem] border-4 border-card shadow-2xl z-0">
        <MapaReal />
      </div>

      {/* Simulación de Sellos Principales */}
      <div className="bg-primary/5 border border-dashed border-primary/20 rounded-[2.5rem] p-4 flex flex-col gap-3">
        <p className="text-[9px] font-black uppercase text-center text-primary flex items-center justify-center gap-2 opacity-60">
          <QrCode size={12} /> {lang === "es" ? "Escanear Sello Principal" : "Scan Primary Stamp"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PUEBLOS_DEMO.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSimularMint(p.id)}
              disabled={simulando !== null}
              className={`text-[8px] px-4 py-2 rounded-full font-bold transition-all ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-white border border-primary/20"}`}
            >
              {simulando === p.id ? "..." : p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <span className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest">
            <Stamp size={14} /> {lang === "es" ? "Colección Principal" : "Primary Collection"}
          </span>
          <span className="text-[10px] font-bold opacity-50">
            {cargando ? "..." : `${sellos.length} NFTs`}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {sellos.map((s) => (
            <div
              key={s.id}
              onClick={() => onStampClick(s)}
              className="bg-card rounded-2xl overflow-hidden shadow-md active:scale-95 cursor-pointer border border-white/5 relative aspect-square group"
            >
              <img src={s.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Sello" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                <p className="text-[6px] font-black uppercase text-white truncate">{s.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
