"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";
import { formatEther, formatUnits } from "viem";
import { Loader2, Coins, Droplets, Fingerprint, Wallet, ShieldCheck, UserCheck, PowerOff } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useUBIClaim } from "@/hooks/useUBIClaim";
import { useSuperfluidStream } from "@/hooks/useSuperfluidStream";
import { useUbiFlowContext } from "@/lib/ubi-flow-context";

const G_DOLLAR_ADDRESS = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A";
const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const CEUR_ADDRESS = "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73";

export function DashboardWalletView() {
  const { isDarkMode } = useTheme();
  
  // WALLET A LOGIC (Privy/Wagmi)
  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");
  const { user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const walletAAddress = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const [walletABalances, setWalletABalances] = useState({ celo: "0.00", gDollar: "0.00", cUSD: "0.00", cEUR: "0.00" });

  useEffect(() => {
    if (!walletAAddress) return;
    const fetchA = async () => {
      const { createPublicClient, http, getAddress, formatEther, formatUnits } = await import("viem");
      const { celo } = await import("viem/chains");
      const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
      const abi = [{ type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" }] as const;
      
      const addr = walletAAddress as `0x${string}`;
      try {
        const [balCelo, balG, balCUSD, balCEUR] = await Promise.all([
          publicClient.getBalance({ address: addr }).catch(() => 0n),
          publicClient.readContract({ address: getAddress(G_DOLLAR_ADDRESS), abi, functionName: "balanceOf", args: [addr] }).catch(() => 0n),
          publicClient.readContract({ address: getAddress(CUSD_ADDRESS), abi, functionName: "balanceOf", args: [addr] }).catch(() => 0n),
          publicClient.readContract({ address: getAddress(CEUR_ADDRESS), abi, functionName: "balanceOf", args: [addr] }).catch(() => 0n),
        ]);

        setWalletABalances({
          celo: parseFloat(formatEther(balCelo as bigint)).toFixed(4),
          gDollar: parseFloat(formatUnits(balG as bigint, 18)).toFixed(2),
          cUSD: parseFloat(formatEther(balCUSD as bigint)).toFixed(2),
          cEUR: parseFloat(formatEther(balCEUR as bigint)).toFixed(2),
        });
      } catch (e) {
        console.error("Wallet A balance fetch error", e);
      }
    };
    fetchA();
  }, [walletAAddress]);

  // WALLET B LOGIC (Universal Provider Aislado)
  const { 
    connect: connectWalletB, 
    disconnect: disconnectWalletB, 
    address: walletBAddress, 
    isConnecting: isConnectingB, 
    balanceG: gDollarBalanceB,
    balanceNativeB,
    balanceCUSDB,
    walletClientB
  } = useUbiFlowContext();

  const { checkEntitlement, claimUBI, isClaiming, entitlement, hasClaim, timeUntilNextClaim } = useUBIClaim();
  const { startStream, stopStream, checkActiveStream, isProcessing: isStreaming, DEFAULT_FLOW_RATE } = useSuperfluidStream();

  const [isWhitelistedB, setIsWhitelistedB] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [activeFlowRate, setActiveFlowRate] = useState<bigint>(0n);
  const [streamTick, setStreamTick] = useState(0);

  // TICKER DEL RELOJ
  useEffect(() => {
    if (!isStreamingActive || activeFlowRate === 0n) return;
    const interval = setInterval(() => {
      setStreamTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreamingActive, activeFlowRate]);

  // BYPASS DE IDENTIDAD (Inferencia por Saldo G$)
  useEffect(() => {
    if (walletBAddress) {
      if (gDollarBalanceB > 0n) {
        setIsWhitelistedB(true);
        checkEntitlement(walletBAddress);
      } else {
        setIsWhitelistedB(false);
      }
      
      // Consultar Flujos Activos de Superfluid
      const fetchFlow = async () => {
        const DESTINATION = walletAAddress || "0xE2f221A0D6Bb28e95D82CAfFc1d08875B3316174";
        const flow = await checkActiveStream(walletBAddress, DESTINATION as string);
        console.log("Superfluid Net Flow Detectado:", flow);
        // Si el flow es distinto de 0, significa que ESTÁ ENVIANDO o RECIBIENDO fondos (está goteando)
        if (flow !== 0n) {
          setIsStreamingActive(true);
          setActiveFlowRate(flow);
        } else {
          setIsStreamingActive(false);
          setActiveFlowRate(0n);
        }
      };
      fetchFlow();
    } else {
      setIsWhitelistedB(false);
      setIsStreamingActive(false);
      setActiveFlowRate(0n);
    }
  }, [walletBAddress, gDollarBalanceB, walletAAddress]);

  const handleVerifyIdentity = () => {
    // Si no tiene G$, simulamos o redirigimos al FaceTec
    setIsVerifying(true);
    setTimeout(() => {
      setIsWhitelistedB(true);
      setIsVerifying(false);
      checkEntitlement(walletBAddress as string);
    }, 2000);
  };


  const toggleStream = async () => {
    if (!walletClientB || !walletBAddress) return;
    const DESTINATION = walletAAddress || "0xE2f221A0D6Bb28e95D82CAfFc1d08875B3316174";
    if (isStreamingActive) {
      await stopStream(walletClientB, walletBAddress, DESTINATION as string);
      setIsStreamingActive(false);
    } else {
      await startStream(walletClientB, walletBAddress, DESTINATION as string, DEFAULT_FLOW_RATE);
      setIsStreamingActive(true);
    }
  };

  const handleClaim = async () => {
    if (!walletClientB || !walletBAddress) return;
    await claimUBI(walletClientB, walletBAddress);
  };

  return (
    <div className={`flex flex-col gap-6 px-4 py-6 relative pb-24 min-h-screen ${isDarkMode ? "bg-[#0F0A1F] text-white" : "bg-[#faf8f5] text-slate-900"}`}>
      
      {/* WALLET A: LOGIN (Celo/MiniPay) */}
      <section className={`p-5 rounded-[2rem] border shadow-xl ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-primary/20"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <ShieldCheck size={16} /> Wallet A (Login/Gas)
          </h3>
          <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold border border-emerald-500/20">
            {walletAAddress ? "Connected" : "No Login"}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-mono opacity-70 truncate">{walletAAddress || "Inicia sesión para ver tu balance"}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-primary/5 p-3 rounded-xl border border-primary/10">
              <span className="text-[10px] font-bold uppercase opacity-60">CELO</span>
              <span className="text-sm font-black">{walletABalances.celo}</span>
            </div>
            <div className="flex flex-col bg-primary/5 p-3 rounded-xl border border-primary/10">
              <span className="text-[10px] font-bold uppercase opacity-60">G$</span>
              <span className="text-sm font-black text-primary">{walletABalances.gDollar}</span>
            </div>
            <div className="flex flex-col bg-primary/5 p-3 rounded-xl border border-primary/10">
              <span className="text-[10px] font-bold uppercase opacity-60">cUSD</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{walletABalances.cUSD}</span>
            </div>
            <div className="flex flex-col bg-primary/5 p-3 rounded-xl border border-primary/10">
              <span className="text-[10px] font-bold uppercase opacity-60">cEUR</span>
              <span className="text-sm font-black text-green-600 dark:text-green-400">{walletABalances.cEUR}</span>
            </div>
          </div>
        </div>
      </section>

      {/* WALLET B: UBI (GoodWallet) */}
      <section className={`p-5 rounded-[2rem] border shadow-xl relative overflow-hidden ${isDarkMode ? "bg-primary/10 border-primary/30" : "bg-primary/5 border-primary/20"}`}>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Coins size={16} /> Wallet B (GoodWallet UBI)
          </h3>
          {!walletBAddress ? (
            <button 
              onClick={connectWalletB}
              disabled={isConnectingB}
              className="text-[8px] bg-primary text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg active:scale-95"
            >
              {isConnectingB ? <Loader2 size={12} className="animate-spin" /> : "Conectar B"}
            </button>
          ) : (
            <button 
              onClick={disconnectWalletB}
              className="text-[8px] bg-red-500 text-white px-2 py-1 rounded-full font-bold border border-red-500/20 flex items-center gap-1 shadow-md hover:bg-red-600"
            >
              <PowerOff size={10} /> Desconectar
            </button>
          )}
        </div>

        {walletBAddress && (
          <div className="flex flex-col gap-4 relative z-10 animate-fade-in">
            <p className="text-[10px] font-mono opacity-70 truncate text-emerald-600 dark:text-emerald-400 font-bold">{walletBAddress}</p>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 opacity-70">G$</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{parseFloat(formatUnits(gDollarBalanceB, 18)).toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                <span className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400 opacity-70">cUSD</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">{parseFloat(formatEther(balanceCUSDB)).toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                <span className="text-[9px] font-bold uppercase text-yellow-600 dark:text-yellow-400 opacity-70">CELO</span>
                <span className="text-xs font-black text-yellow-600 dark:text-yellow-400">{parseFloat(formatEther(balanceNativeB)).toFixed(4)}</span>
              </div>
            </div>
            
            {/* Identity & Claim UBI */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-primary/10"}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase flex items-center gap-1 opacity-80">
                  <Fingerprint size={14} /> G$ Identity
                </span>
                {!isWhitelistedB ? (
                  <button 
                    onClick={handleVerifyIdentity}
                    disabled={isVerifying}
                    className="text-[9px] font-black text-primary hover:underline flex items-center gap-1"
                  >
                    {isVerifying ? <Loader2 size={12} className="animate-spin" /> : "FaceTec Verificación →"}
                  </button>
                ) : (
                  <span className="text-emerald-500 font-black text-[9px] uppercase flex items-center gap-1">
                    <UserCheck size={12} /> Verificado (Bypass)
                  </span>
                )}
              </div>

              {/* Botón Claim UBI (Sólo si está verificado) */}
              {isWhitelistedB ? (
                <div className="mt-2 flex flex-col items-center">
                  <div className="w-full flex justify-between items-center bg-primary/10 p-3 rounded-xl mb-3">
                    <span className="text-[10px] font-bold uppercase">UBI Disponible</span>
                    <span className="text-xs font-black text-primary">
                      {hasClaim ? formatUnits(entitlement, 18) : "0.00"} G$
                    </span>
                  </div>
                  <button 
                    onClick={handleClaim}
                    disabled={isClaiming || !hasClaim}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {isClaiming ? <Loader2 size={16} className="animate-spin" /> : <Coins size={16} />}
                    {hasClaim ? `Reclamar ${formatUnits(entitlement, 18)} G$` : `Vuelve en ${timeUntilNextClaim}`}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Verifica tu rostro en GoodDollar (o recibe G$) para desbloquear el reclamo del UBI.
                </p>
              )}
            </div>

            {/* Superfluid Streaming */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-black/40 border-white/10" : "bg-white/60 border-primary/10"}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase flex items-center gap-1 text-teal-500">
                  <Droplets size={14} /> Superfluid Stream
                </span>
                <span className="text-[9px] font-mono opacity-80">2,000 G$ / Mes</span>
              </div>
              
              {/* Reloj de Conteo Superfluid */}
              {isStreamingActive && (
                <div className="flex flex-col items-center justify-center my-3 gap-2">
                  <div className="animate-pulse bg-teal-500/20 text-teal-500 px-4 py-2 rounded-full font-mono text-xs font-black border border-teal-500/30">
                    {activeFlowRate < 0n ? "Enviando" : "Recibiendo"} {parseFloat(formatEther(activeFlowRate < 0n ? -activeFlowRate : activeFlowRate)).toFixed(6)} G$ / seg
                  </div>
                  <div className="text-[10px] text-teal-500/80 font-mono font-bold">
                    Flujo en esta sesión: <span className="text-teal-400">{parseFloat(formatEther((activeFlowRate < 0n ? -activeFlowRate : activeFlowRate) * BigInt(streamTick))).toFixed(6)}</span> G$
                  </div>
                </div>
              )}

              <button 
                onClick={toggleStream}
                disabled={isStreaming}
                className={`w-full font-black text-[10px] uppercase py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  isStreamingActive 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-teal-500 text-white hover:bg-teal-600"
                }`}
              >
                {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Droplets size={16} />}
                {isStreamingActive ? "Detener Goteo" : "Patrocinar Artesano"}
              </button>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}
