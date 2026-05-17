import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useTheme } from "@/lib/theme-context";
import { IdentitySDK } from "@goodsdks/citizen-sdk";
import { createPublicClient, http, stringToHex, formatUnits, parseAbiItem } from "viem";
import { useUBIClaim } from "@/hooks/useUBIClaim";
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
import { WalletBalanceButton } from "@/components/wallet-balance-button";

const MapaReal = dynamic(() => import("@/components/mapa"), { ssr: false });
const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://rpc.ankr.com/celo"),
});

const PUEBLOS_DEMO = [
  { id: "guatape_socalos", name: "Guatapé" },
  { id: "sombrillas_guatape", name: "Sombrillas" },
];

// 📍 Traduce el hash del tokenURI al puebloId — sincronizado con comunidad-view.tsx
// Cuando el JSON de Pinata incluya "puebloId" en la raíz, este diccionario se volverá innecesario.
const URI_TO_PUEBLO: Record<string, string> = {
  // ✅ ACTIVOS (CORREGIDOS)
  "bafkreigqcbgkpmhml3zahydb7hq7gb373nhtjbssc4lko6su42l6tzrxf4": "guatape_socalos",
  "bafkreiegxd63qmcetnfhryf3x7uk63ayxnezqpx7nk6zup3532dzzfznu4": "sombrillas_guatape",
  // ❌ ACTIVOS (CON ERROR DE SINTAXIS ORIGINAL)
  "bafkreigeqrlcc3gtrjlld7bdatruhv6uy34rfxtv4ym6ud5h6io3fdkwku": "guatape_socalos",
  "bafkreiblodwup66665rxrhpkzojgrolaw5zhq3psn56wp6zaqr6lmsrxhm": "sombrillas_guatape",
  // 🔜 ORIENTE ANTIOQUEÑO
  "QmPENDING_ElPenol":      "el_penol_piedra",
  "QmPENDING_Rionegro":     "rionegro_colonial",
  "QmPENDING_LaCeja":       "la_ceja_flores",
  "QmPENDING_CarmenViboral":"carmen_de_viboral_ceramica",
  "QmPENDING_ElRetiro":     "el_retiro_cuero",
  "QmPENDING_SanAntonioPer":"san_antonio_pereira",
  "QmPENDING_Marinilla":    "marinilla_patrimonio",
  "QmPENDING_Guarne":       "guarne_campesino",
  "QmPENDING_Santuario":    "santuario_refi",
  "QmPENDING_SanVicente":   "san_vicente_ferrer",
  // 🔜 ÁREA METROPOLITANA
  "QmPENDING_Envigado":     "envigado_arte",
  "QmPENDING_Medellin":     "medellin_centro",
  "QmPENDING_Sabaneta":     "sabaneta_artesanal",
  "QmPENDING_Caldas":       "caldas_tradicion",
  // 🔜 OCCIDENTE ANTIOQUEÑO
  "QmPENDING_SantaFe":      "santafe_de_antioquia",
};

export function PasaporteView({
  onStampClick,
  onNavigate,
}: {
  onStampClick: (sello: any) => void;
  onNavigate?: (tab: any) => void;
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

  const { checkEntitlement, claimUBI, isClaiming, entitlement, hasClaim } = useUBIClaim();

  const handleCheckIdentity = async () => {
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
      if (result.isWhitelisted) {
        checkEntitlement(userAddress as string);
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
      const MAX_IDS = 1500;
      const CHUNK_SIZE = 50;
      let misIds: bigint[] = [];

      for (let offset = 0; offset < MAX_IDS; offset += CHUNK_SIZE) {
        const ids = Array.from({ length: CHUNK_SIZE }, (_, i) => BigInt(offset + i));
        
        const owners = await publicClient.multicall({
          contracts: ids.map((id) => ({
            ...PASSPORT_CONTRACT,
            address: PASSPORT_CONTRACT.address as `0x${string}`,
            functionName: "ownerOf",
            args: [id],
          })),
          allowFailure: true,
        });

        let chunkHasValidTokens = false;
        
        const foundIds = ids.filter((id, i) => {
          if (owners[i].status !== "success") return false;
          chunkHasValidTokens = true;
          return (owners[i].result as string).toLowerCase() === walletAddress.toLowerCase();
        });

        misIds.push(...foundIds);

        // Si este chunk completo falló (es decir, ningún ID tiene dueño porque no han sido minteados),
        // podemos detener el escaneo para no consultar 1500 IDs vacíos en vano.
        if (!chunkHasValidTokens) break;
      }

      if (misIds.length === 0) {
        setSellos([]);
        setCargando(false);
        return;
      }

      // Hacemos el multicall SOLO para los IDs que estamos seguros que tiene
      const uris = await publicClient.multicall({
        contracts: misIds.map((id) => ({
          ...PASSPORT_CONTRACT,
          address: PASSPORT_CONTRACT.address as `0x${string}`,
          functionName: "tokenURI",
          args: [id],
        })),
        allowFailure: true,
      });

      const nuevosSellos = (
        await Promise.all(
          uris.map(async (res, i) => {
            if (res.status !== "success") return null;
            let rawUrl = res.result as string;
            
            // BYPASS ESTRATÉGICO: Forzamos el enrutamiento a un gateway público y gratuito
            // sin importar si viene como ipfs:// o con dominios bloqueados de Pinata.
            let finalUrl = rawUrl
              .replace("ipfs://", "https://ipfs.io/ipfs/")
              .replace("https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/")
              .replace("https://amethyst-junior-muskox-299.mypinata.cloud/ipfs/", "https://ipfs.io/ipfs/");

            let ipfsHash = rawUrl.split("/").pop() || "";
            let derivedPuebloId = URI_TO_PUEBLO[ipfsHash] || "guatape_socalos";

            try {
              const metaRes = await fetch(finalUrl);
              const meta = await metaRes.json();
              
              let rawImage = meta.image || "";
              const finalImage = rawImage
                .replace("ipfs://", "https://ipfs.io/ipfs/")
                .replace("https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/")
                .replace("https://amethyst-junior-muskox-299.mypinata.cloud/ipfs/", "https://ipfs.io/ipfs/");

              return {
                ...meta,
                id: misIds[i].toString(),
                puebloId: meta.puebloId || derivedPuebloId,
                image: finalImage,
              };
            } catch (error) {
              console.error(`[Pasaporte] Error al parsear metadata del ID ${misIds[i]}:`, finalUrl, error);
              // FALLBACK: Si no es un JSON o está corrupto, asumimos que es una imagen cruda (PNG).
              return {
                name: `Viaje #${misIds[i].toString()}`,
                description: "Sello Digital (Recuperado)",
                id: misIds[i].toString(),
                puebloId: derivedPuebloId,
                image: finalUrl,
              };
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

  const [puebloActivo, setPuebloActivo] = useState("Guatapé");

  const handleSimularMint = async (puebloId: string, puebloName: string) => {
    if (!authenticated) {
      if (!isMiniPayRoute) return login();
      else { alert("MiniPay no conectado."); return; }
    }
    setPuebloActivo(puebloName); // Mueve el mapa al pueblo seleccionado
    setSimulando(puebloId);
    try {
      const res = await fetch("/api/mint-passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: userAddress, puebloId }),
      });
      if (res.ok) {
        alert(`¡Sello de ${puebloName} estampado! 🤖`);
        leerPasaporte();
      }
    } catch (e) { console.error(e); } finally { setSimulando(null); }
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
      <header className="flex justify-between items-center pt-2 px-2">
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${isDarkMode ? "text-[#7a7a78]" : "text-[#6b6862]"}`}>
            <Fingerprint size={11} /> Digital Passport · Identity
          </span>
        </div>
        {onNavigate && <WalletBalanceButton onOpen={() => onNavigate("dashboard")} />}
      </header>

      <div className="h-64 w-full overflow-hidden rounded-[2.5rem] border-4 border-[#faf9f7] dark:border-[#0d0d0d] shadow-2xl z-0">
        <MapaReal selectedTown={puebloActivo} />
      </div>

      {/* Simulación de Sellos Principales */}
      <div className={`p-4 rounded-[2.5rem] border border-dashed ${isDarkMode ? "bg-white/5 border-white/10" : "bg-[#faf9f7] border-[#dcd8d1]"}`}>
        <p className={`text-[9px] font-black uppercase text-center mb-3 opacity-60 flex items-center justify-center gap-2 ${isDarkMode ? "text-[#7a7a78]" : "text-[#6b6862]"}`}>
          <QrCode size={12} /> {lang === "es" ? "Simular Ubicación" : "Simulate Location"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {([
            { id: "guatape_socalos", name: "Guatapé" },
            { id: "jardin_cafe", name: "Jardín" },
            { id: "santafe_de_antioquia", name: "Santa Fe" },
          ]).map((p) => (
            <button
              key={p.id}
              onClick={() => handleSimularMint(p.id, p.name)}
              disabled={simulando !== null}
              className={`text-[9px] px-5 py-2.5 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 ${
                puebloActivo === p.name 
                  ? isDarkMode ? "bg-[#5FF5B4] text-[#050505]" : "bg-[#0d0d0c] text-[#f2efeb]"
                  : isDarkMode ? "bg-white/5 text-[#7a7a78]" : "bg-white text-[#6b6862] border border-[#dcd8d1]"
              }`}
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
              className="bg-card rounded-2xl overflow-hidden shadow-lg active:scale-95 cursor-pointer border border-primary/20 relative aspect-square group"
            >
              <img src={s.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Sello" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent flex flex-col items-center justify-end p-2 pb-3">
                <span className="text-[7px] font-black uppercase text-white truncate mb-1 opacity-80">{s.name}</span>
                <button className="bg-primary hover:bg-primary/90 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-xl border border-white/20 flex items-center gap-1 w-full justify-center">
                  📸 Álbum
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
