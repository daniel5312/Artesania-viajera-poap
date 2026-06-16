"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther, formatUnits } from "viem";
import {
  Loader2, Coins, Droplets, Fingerprint, ShieldCheck,
  PowerOff, Stamp, ShoppingBag, TrendingUp, Wallet,
  Users, Activity, ArrowUpRight, MapPin, LockKeyhole
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useGlobal } from "@/lib/global-context";
import { useUBIClaim } from "@/hooks/useUBIClaim";
import { useSuperfluidStream } from "@/hooks/useSuperfluidStream";
import { useUbiFlowContext } from "@/lib/ubi-flow-context";
import { REFI_SPLITTER_CONTRACT } from "@/constants/contracts";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";

const G_DOLLAR_ADDRESS = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A";
const CUSD_ADDRESS     = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const CEUR_ADDRESS     = "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73";

const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });

// ─── NEAR-inspired style tokens ───────────────────────────────────────────
const S = {
  card: (d: boolean) => d ? "bg-[#0d0d0d] border border-[#1f1f1e] rounded-2xl" : "bg-[#faf9f7] border border-[#dcd8d1] rounded-2xl",
  inner: (d: boolean) => d ? "bg-[#121212] border border-[#1f1f1e] rounded-xl" : "bg-[#f2efeb] border border-[#dcd8d1] rounded-xl",
  muted: (d: boolean) => d ? "text-[#7a7a78]" : "text-[#6b6862]",
  txt: (d: boolean) => d ? "text-[#e2e2df]" : "text-[#0d0d0c]",
  mint: "text-[#5FF5B4]",
  sectionLabel: (d: boolean) => d ? "text-[10px] font-black uppercase tracking-[0.15em] text-[#7a7a78] flex items-center gap-1.5 mb-4" : "text-[10px] font-black uppercase tracking-[0.15em] text-[#6b6862] flex items-center gap-1.5 mb-4",
  ctaPrimary: (d: boolean) => d ? "bg-[#5FF5B4] text-[#050505] font-black" : "bg-[#0d0d0c] text-[#f2efeb] font-black",
  ghost: (d: boolean) => d ? "border border-[#1f1f1e] text-[#7a7a78]" : "border border-[#dcd8d1] text-[#6b6862]",
};

// ─── Wallet A balances ────────────────────────────────────────────────────
function useWalletABalances(address: string | undefined) {
  const [b, setB] = useState({ celo: "0.0000", cUSD: "0.00", cEUR: "0.00" });
  useEffect(() => {
    if (!address) return;
    const abi = [{ type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" }] as const;
    (async () => {
      try {
        const addr = address as `0x${string}`;
        const [balCelo, balCUSD, balCEUR] = await Promise.all([
          publicClient.getBalance({ address: addr }).catch(() => 0n),
          publicClient.readContract({ address: CUSD_ADDRESS as `0x${string}`, abi, functionName: "balanceOf", args: [addr] }).catch(() => 0n),
          publicClient.readContract({ address: CEUR_ADDRESS as `0x${string}`, abi, functionName: "balanceOf", args: [addr] }).catch(() => 0n),
        ]);
        setB({
          celo: parseFloat(formatEther(balCelo as bigint)).toFixed(4),
          cUSD: parseFloat(formatEther(balCUSD as bigint)).toFixed(2),
          cEUR: parseFloat(formatEther(balCEUR as bigint)).toFixed(2),
        });
      } catch {}
    })();
  }, [address]);
  return b;
}

// ─── ReFi metrics ─────────────────────────────────────────────────────────
function useArtisanMetrics(address: string | undefined) {
  const [m, setM] = useState({ totalReceived: "0.0000", salesCount: 0, poolDonations: "0.0000" });
  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const logs = await publicClient.getLogs({
          address: REFI_SPLITTER_CONTRACT.address as `0x${string}`,
          event: { type: "event", name: "ImpactGenerated", inputs: [
            { name: "artesano", type: "address", indexed: true },
            { name: "total", type: "uint256", indexed: false },
            { name: "treasuryImpact", type: "uint256", indexed: false },
            { name: "poolsImpact", type: "uint256", indexed: false },
          ]},
          args: { artesano: address as `0x${string}` },
          fromBlock: 0n, toBlock: "latest",
        });
        let total = 0n, pools = 0n;
        for (const log of logs) {
          const a = log.args as any;
          if (a.total) total += a.total;
          if (a.poolsImpact) pools += a.poolsImpact;
        }
        setM({ totalReceived: parseFloat(formatEther((total * 90n) / 100n)).toFixed(4), salesCount: logs.length, poolDonations: parseFloat(formatEther(pools)).toFixed(4) });
      } catch {}
    })();
  }, [address]);
  return m;
}

// ─── Shared Wallet B / Goteo Component ─────────────────────────────────────
function GoodWalletSection({ walletAAddress, isDark: d }: { walletAAddress: string | undefined; isDark: boolean }) {
  const { connect: connectB, disconnect: disconnectB, address: walletB,
    isConnecting: isConnectingB, balanceG, balanceNativeB, balanceCUSDB, walletClientB,
  } = useUbiFlowContext();

  const { checkEntitlement, claimUBI, isClaiming, entitlement, hasClaim, timeUntilNextClaim } = useUBIClaim();
  const { startStream, stopStream, checkActiveStream, isProcessing: isStreaming, DEFAULT_FLOW_RATE } = useSuperfluidStream();

  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [activeFlowRate, setActiveFlowRate] = useState<bigint>(0n);
  const [streamTick, setStreamTick] = useState(0);

  useEffect(() => {
    if (!isStreamingActive || activeFlowRate === 0n) return;
    const t = setInterval(() => setStreamTick(p => p + 1), 100);
    return () => clearInterval(t);
  }, [isStreamingActive, activeFlowRate]);

  useEffect(() => {
    if (!walletB) { setIsStreamingActive(false); return; }
    const DEST = walletAAddress ?? "0xE2f221A0D6Bb28e95D82CAfFc1d08875B3316174";
    checkActiveStream(walletB, DEST).then(flow => {
      if (flow !== 0n) { setIsStreamingActive(true); setActiveFlowRate(flow); }
      else { setIsStreamingActive(false); setActiveFlowRate(0n); }
    });
    if (balanceG > 0n) checkEntitlement(walletB);
  }, [walletB, balanceG, walletAAddress]);

  const toggleStream = async () => {
    if (!walletClientB || !walletB) return;
    const DEST = walletAAddress ?? "0xE2f221A0D6Bb28e95D82CAfFc1d08875B3316174";
    if (isStreamingActive) { await stopStream(walletClientB, walletB, DEST); setIsStreamingActive(false); }
    else { await startStream(walletClientB, walletB, DEST, DEFAULT_FLOW_RATE); setIsStreamingActive(true); }
  };

  const absRate = activeFlowRate < 0n ? -activeFlowRate : activeFlowRate;

  return (
    <section className={`p-5 relative overflow-hidden ${S.card(d)}`}>
      {d && <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#5FF5B4]/8 blur-[50px]" />}
      <div className="flex items-center justify-between mb-4">
        <span className={S.sectionLabel(d)}><Coins size={12} /> GoodWallet UBI</span>
        {!walletB ? (
          <button onClick={connectB} disabled={isConnectingB}
            className={`text-[8px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 ${S.ctaPrimary(d)}`}>
            {isConnectingB ? <Loader2 size={11} className="animate-spin" /> : "Conectar B"}
          </button>
        ) : (
          <button onClick={disconnectB}
            className={`text-[8px] px-2 py-1 rounded-full font-bold flex items-center gap-1 ${S.ghost(d)}`}>
            <PowerOff size={9} /> Desconectar
          </button>
        )}
      </div>

      {!walletB && (
        <div className={`mt-2 p-4 rounded-2xl border animate-in slide-in-from-top-2 fade-in duration-500 shadow-xl relative overflow-hidden ${d ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full mt-1 ${d ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
              <UserCheck size={18} />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className={`text-[11px] font-black uppercase tracking-widest ${d ? "text-amber-400" : "text-amber-700"}`}>
                Verificación Requerida
              </h3>
              <p className={`text-[10px] mt-1 mb-3 leading-relaxed ${d ? "text-amber-200/80" : "text-amber-800/80"}`}>
                Crea tu GoodWallet y verifícate facialmente. Luego conéctala aquí para recibir tu Ingreso Básico (UBI) y activar el goteo automático hacia tu billetera principal.
              </p>
              <a 
                href="https://wallet.gooddollar.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${d ? "bg-amber-500 text-amber-950 hover:bg-amber-400" : "bg-amber-500 text-white hover:bg-amber-600"}`}
              >
                👤 Crear GoodWallet
              </a>
            </div>
          </div>
        </div>
      )}

      {walletB && (
        <div className="flex flex-col gap-3">
          <p className={`text-[9px] font-mono truncate ${S.muted(d)}`}>{walletB}</p>
          <div className="grid grid-cols-3 gap-2">
            <div className={`flex flex-col p-2.5 ${S.inner(d)}`}>
              <span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>G$</span>
              <span className={`text-xs font-black tabular-nums ${S.mint}`}>{parseFloat(formatUnits(balanceG, 18)).toFixed(2)}</span>
            </div>
            <div className={`flex flex-col p-2.5 ${S.inner(d)}`}>
              <span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>cUSD</span>
              <span className={`text-xs font-black tabular-nums ${S.txt(d)}`}>{parseFloat(formatEther(balanceCUSDB)).toFixed(2)}</span>
            </div>
            <div className={`flex flex-col p-2.5 ${S.inner(d)}`}>
              <span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>CELO</span>
              <span className={`text-xs font-black tabular-nums ${S.txt(d)}`}>{parseFloat(formatEther(balanceNativeB)).toFixed(4)}</span>
            </div>
          </div>

          <div className={`p-4 ${S.inner(d)}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${S.muted(d)}`}><Fingerprint size={12} /> UBI disponible</span>
              <span className={`text-sm font-black tabular-nums ${S.mint}`}>{hasClaim ? formatUnits(entitlement, 18) : "0.00"} G$</span>
            </div>
            <button onClick={() => claimUBI(walletClientB!, walletB)} disabled={isClaiming || !hasClaim || !walletClientB}
              className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 ${S.ctaPrimary(d)}`}>
              {isClaiming ? <Loader2 size={13} className="animate-spin" /> : <Coins size={13} />}
              {hasClaim ? `Reclamar ${formatUnits(entitlement, 18)} G$` : `Vuelve en ${timeUntilNextClaim}`}
            </button>
          </div>

          <div className={`p-4 ${S.inner(d)}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${S.muted(d)}`}><Droplets size={12} /> Goteo Superfluid</span>
              <span className={`text-[8px] font-mono ${S.muted(d)}`}>2,000 G$/mes</span>
            </div>
            {isStreamingActive && (
              <div className={`flex flex-col items-center py-3 mb-3 rounded-xl border ${d ? "border-[#5FF5B4]/20 bg-[#5FF5B4]/5" : "border-[#00c27b]/15 bg-[#00c27b]/5"}`}>
                <span className={`text-xs font-black font-mono tabular-nums ${S.mint}`}>+{parseFloat(formatEther(absRate)).toFixed(8)} G$/seg</span>
                <span className={`text-[9px] font-mono mt-1 ${S.muted(d)}`}>Esta sesión: <span className={`font-black ${S.mint}`}>{parseFloat(formatEther(absRate * BigInt(Math.floor(streamTick / 10)))).toFixed(8)}</span> G$</span>
              </div>
            )}
            <button onClick={toggleStream} disabled={isStreaming}
              className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${isStreamingActive ? S.ghost(d) : S.ctaPrimary(d)}`}>
              {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <Droplets size={13} />}
              {isStreamingActive ? "Detener Goteo" : "Iniciar Goteo"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOURIST VIEW
// ═══════════════════════════════════════════════════════════════════════════
function TouristView({ walletAAddress, walletABalances, gDollarFormatted, onNavigate }: {
  walletAAddress: string | undefined;
  walletABalances: ReturnType<typeof useWalletABalances>;
  gDollarFormatted: string;
  onNavigate?: (tab: any) => void;
}) {
  const { isDarkMode: d } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <section className={`p-5 relative overflow-hidden ${S.card(d)}`}>
        {d && <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#5FF5B4]/8 blur-[50px]" />}
        <div className="flex items-center justify-between mb-4">
          <span className={S.sectionLabel(d)}><Wallet size={12} /> Wallet Principal (A)</span>
          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${S.ghost(d)}`}>{walletAAddress ? "Celo Mainnet" : "Desconectada"}</span>
        </div>
        <p className={`text-[9px] font-mono truncate mb-3 ${S.muted(d)}`}>{walletAAddress ?? "—"}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>CELO</span><span className={`text-sm font-black tabular-nums ${S.txt(d)}`}>{walletABalances.celo}</span></div>
          <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>G$</span><span className={`text-sm font-black tabular-nums ${S.mint}`}>{gDollarFormatted}</span></div>
        </div>
      </section>

      <GoodWalletSection walletAAddress={walletAAddress} isDark={d} />

      <div className="grid grid-cols-2 gap-2">
        {([
          { tab: "pasaporte", Icon: Stamp,       label: "Pasaporte",  sub: "Sellos & rutas" },
          { tab: "tienda",    Icon: ShoppingBag, label: "Tienda",     sub: "Artesanías digitales" },
          { tab: "comunidad", Icon: Users,       label: "Comunidad",  sub: "Fotos & momentos" },
          { tab: "impacto",   Icon: TrendingUp,  label: "Impacto",    sub: "Métricas ReFi" },
        ] as const).map(({ tab, Icon, label, sub }) => (
          <button key={tab} onClick={() => onNavigate?.(tab as any)}
            className={`group flex flex-col gap-3 p-4 text-left transition-all active:scale-95 hover:opacity-90 ${S.card(d)}`}>
            <Icon size={15} className={S.muted(d)} />
            <div><p className={`text-[11px] font-black uppercase tracking-tight ${S.txt(d)}`}>{label}</p><p className={`text-[9px] ${S.muted(d)}`}>{sub}</p></div>
            <ArrowUpRight size={11} className={`ml-auto ${S.muted(d)} group-hover:text-[#5FF5B4] transition-colors`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTISAN VIEW
// ═══════════════════════════════════════════════════════════════════════════

const ARTISAN_PUEBLO_MAP: Record<string, string> = {
  "0xcb5685779dc289b96f71921e30ffeb18d909f6ed": "guatape_socalos",
  "0x1f90a029013609246573f8b3519c8e352333ab0c": "sombrillas_guatape",
  "0x9158c35f1a054f25f9d45ea47107d54a2ea25945": "el_carmen_ceramica",
  "0x9bc43f955ce11948e4fd6eac28d46875fba9f5f9": "biota_line"
};

function ArtisanView({ walletAAddress, walletABalances, gDollarFormatted }: {
  walletAAddress: string | undefined;
  walletABalances: ReturnType<typeof useWalletABalances>;
  gDollarFormatted: string;
}) {
  const { isDarkMode: d } = useTheme();
  const metrics = useArtisanMetrics(walletAAddress);

  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeQRTab, setActiveQRTab] = useState<"passport" | "artisan">("passport");

  // Default to "envigado" for Hackathon demo if wallet is not in the map
  const puebloId = walletAAddress ? (ARTISAN_PUEBLO_MAP[walletAAddress.toLowerCase()] || "envigado") : "envigado";
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://artesania-viajera.vercel.app";
  const qrPassportUrl = puebloId ? `${baseUrl}/?action=claim_passport&id=${puebloId}` : "";
  const qrStampUrl = puebloId && walletAAddress ? `${baseUrl}/?action=claim_stamp&id=${walletAAddress}` : "";
  
  const currentQrUrl = activeQRTab === "passport" ? qrPassportUrl : qrStampUrl;
  const qrImgSrc = currentQrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentQrUrl)}&color=${d ? "5FF5B4" : "000000"}&bgcolor=${d ? "0d0d0d" : "ffffff"}` : "";

  const [viewTab, setViewTab] = useState<"tools" | "wallet">("tools");

  const handleVerifyLocation = () => {
    setIsVerifying(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            await fetch("/api/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                walletAddress: walletAAddress || "0xArtesanoAnonimo",
                lat: latitude,
                lng: longitude,
                puebloId
              })
            });
            setIsLocationVerified(true);
          } catch (e) {
            console.error("Error sending location to API:", e);
            setIsLocationVerified(true);
          } finally {
            setIsVerifying(false);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          alert("Error de GPS: " + error.message + ". Usando simulador para la demo.");
          setTimeout(() => {
            setIsLocationVerified(true);
            setIsVerifying(false);
          }, 1500);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setTimeout(() => {
        setIsLocationVerified(true);
        setIsVerifying(false);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selector Principal del Dashboard */}
      <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 mb-2">
        <button
          onClick={() => setViewTab("tools")}
          className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewTab === "tools" ? d ? "bg-[#121212] text-white shadow-md border border-white/10" : "bg-white text-black shadow-md border border-black/10" : "text-zinc-500"}`}
        >
          Herramientas
        </button>
        <button
          onClick={() => setViewTab("wallet")}
          className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewTab === "wallet" ? d ? "bg-[#121212] text-white shadow-md border border-white/10" : "bg-white text-black shadow-md border border-black/10" : "text-zinc-500"}`}
        >
          Mi Billetera
        </button>
      </div>

      {viewTab === "tools" && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 🏅 CREDENCIAL NFT OFICIAL */}
          {puebloId && (
            <section className={`p-5 flex flex-col items-center text-center ${S.card(d)}`}>
              <span className={S.sectionLabel(d)}><ShieldCheck size={12} /> Credencial Oficial</span>
              <div className="relative mt-2 mb-4 group w-full max-w-[200px]">
                <div className={`absolute inset-0 bg-gradient-to-r ${d ? "from-[#5FF5B4]/20 to-[#8162f3]/20" : "from-[#00c27b]/20 to-[#6039e3]/20"} rounded-2xl blur-xl group-hover:blur-2xl transition-all`}></div>
                <img src="/images/jaguar.png" alt="NFT Credencial Envigado" className="relative w-full rounded-2xl shadow-xl border-2 border-[#5FF5B4]/30 object-cover aspect-square" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} className="text-[#5FF5B4]" />
                  <span className="text-[8px] font-bold text-white">Verificado</span>
                </div>
              </div>
              <p className={`text-[10px] ${S.muted(d)}`}>Esta es tu credencial NFT on-chain. Con ella, los turistas pueden ubicarte en el mapa oficial del pueblo.</p>
            </section>
          )}

          {/* 🎁 REGALAR SELLO (FÍSICO) */}
          {puebloId && (
            <section className={`p-5 relative overflow-hidden flex flex-col items-center text-center transition-all duration-500 ${isLocationVerified ? S.card(d) : `border-dashed border-2 ${d ? "border-[#5FF5B4]/30 bg-[#121212]" : "border-[#00c27b]/30 bg-[#f9f9f9]"} rounded-2xl`}`}>
              <span className={S.sectionLabel(d)}><Stamp size={12} /> Regalos para Turistas</span>
              
              {!isLocationVerified ? (
                <div className="flex flex-col items-center py-6">
                  <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${d ? "bg-white/5" : "bg-black/5"}`}>
                    <LockKeyhole size={24} className={d ? "text-white/40" : "text-black/40"} />
                  </div>
                  <p className={`text-[11px] font-bold mb-2 ${S.txt(d)}`}>Códigos Bloqueados</p>
                  <p className={`text-[9px] mb-6 max-w-[200px] ${S.muted(d)}`}>
                    Demuestra que estás en tu puesto de trabajo para habilitar tus códigos QR.
                  </p>
                  <button onClick={handleVerifyLocation} disabled={isVerifying}
                    className={`py-2.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${S.ctaPrimary(d)}`}>
                    {isVerifying ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    {isVerifying ? "Verificando GPS..." : "Verificar Ubicación"}
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5FF5B4]/10 text-[#5FF5B4] text-[9px] font-bold mb-3">
                    <MapPin size={10} /> Ubicación Verificada
                  </div>

                  {/* Selector de QRs */}
                  <div className="flex bg-black/10 dark:bg-white/5 rounded-xl p-1 mb-4 w-full max-w-[240px]">
                    <button
                      onClick={() => setActiveQRTab("passport")}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${activeQRTab === "passport" ? "bg-[#5FF5B4] text-black shadow-md" : "text-zinc-500 dark:text-zinc-400"}`}
                    >
                      Pasaporte Pueblo
                    </button>
                    <button
                      onClick={() => setActiveQRTab("artisan")}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${activeQRTab === "artisan" ? "bg-[#8162f3] text-white shadow-md" : "text-zinc-500 dark:text-zinc-400"}`}
                    >
                      Sello Único
                    </button>
                  </div>

                  <p className={`text-[9px] mb-4 min-h-[30px] flex items-center ${S.muted(d)}`}>
                    {activeQRTab === "passport" 
                      ? "Escaneo principal. El turista recibe el pasaporte base del pueblo si aún no lo tiene."
                      : "Escaneo por compra. El turista recibe tu NFT único dentro del pasaporte para guardar recuerdos."}
                  </p>
                  
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-border/20">
                    <img src={qrImgSrc} alt="QR de Regalo" className="w-48 h-48 rounded-xl object-contain transition-opacity duration-300" />
                  </div>

                  <button 
                    onClick={() => {
                      if (currentQrUrl) {
                        window.location.href = currentQrUrl + "&simulate=true";
                      }
                    }}
                    className="mt-4 px-5 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                  >
                    Simular Escaneo de QR
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {viewTab === "wallet" && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <section className={`p-5 relative overflow-hidden ${S.card(d)}`}>
            {d && <div className="pointer-events-none absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#5FF5B4]/6 blur-[50px]" />}
            <span className={S.sectionLabel(d)}><Activity size={12} /> Métricas ReFi</span>
            <div className="grid grid-cols-3 gap-2">
              <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>Ganado</span><span className={`text-sm font-black tabular-nums ${S.mint}`}>{metrics.totalReceived}</span><span className={`text-[7px] font-bold ${S.muted(d)}`}>CELO</span></div>
              <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>Ventas</span><span className={`text-sm font-black tabular-nums ${S.txt(d)}`}>{metrics.salesCount}</span><span className={`text-[7px] font-bold ${S.muted(d)}`}>TOTAL</span></div>
              <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>Pools</span><span className={`text-sm font-black tabular-nums ${S.txt(d)}`}>{metrics.poolDonations}</span><span className={`text-[7px] font-bold ${S.muted(d)}`}>CELO</span></div>
            </div>
          </section>

          <section className={`p-5 ${S.card(d)}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={S.sectionLabel(d)}><ShieldCheck size={12} /> Wallet Principal</span>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${S.ghost(d)}`}>{walletAAddress ? "Celo Mainnet" : "—"}</span>
            </div>
            <p className={`text-[9px] font-mono truncate mb-3 ${S.muted(d)}`}>{walletAAddress ?? "—"}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>CELO</span><span className={`text-sm font-black tabular-nums ${S.txt(d)}`}>{walletABalances.celo}</span></div>
              <div className={`flex flex-col p-3 ${S.inner(d)}`}><span className={`text-[8px] font-bold uppercase mb-1 ${S.muted(d)}`}>G$</span><span className={`text-sm font-black tabular-nums ${S.mint}`}>{gDollarFormatted}</span></div>
            </div>
          </section>

          <GoodWalletSection walletAAddress={walletAAddress} isDark={d} />
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function DashboardWalletView({ onNavigate }: { onNavigate?: (tab: any) => void } = {}) {
  const { isDarkMode: d } = useTheme();
  const { userRole, gDollarFormatted } = useGlobal();
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const walletAAddress = (wagmiAddress ?? user?.wallet?.address) as `0x${string}` | undefined;
  const walletABalances = useWalletABalances(walletAAddress);
  const role = userRole ?? "turista";

  return (
    <div className={`flex flex-col gap-3 px-4 py-5 pb-28 min-h-screen ${d ? "bg-[#050505]" : "bg-[#f2efeb]"}`}>
      {role === "turista" ? (
        <TouristView walletAAddress={walletAAddress} walletABalances={walletABalances} gDollarFormatted={gDollarFormatted} onNavigate={onNavigate} />
      ) : (
        <ArtisanView walletAAddress={walletAAddress} walletABalances={walletABalances} gDollarFormatted={gDollarFormatted} />
      )}
    </div>
  );
}
