"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http, formatUnits, parseAbiItem } from "viem";
import { celo } from "viem/chains";
import { Zap, Leaf, Users, Globe } from "lucide-react";
import { REFI_SPLITTER_ADDRESS } from "@/constants/contracts";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

// Dirección del contrato ReFiSplitter desplegado
const SPLITTER_ADDRESS = REFI_SPLITTER_ADDRESS as `0x${string}`;

// ABI mínimo para leer los eventos ImpactGenerated
const SPLITTER_EVENTS_ABI = [
  parseAbiItem(
    "event ImpactGenerated(address indexed buyer, address indexed treasury, address[] pools, uint256 treasuryAmount, uint256 perPoolAmount, uint256 sellerAmount)"
  ),
] as const;

interface ImpactStats {
  totalTransactions: number;
  totalImpactG: bigint;    // Total G$ hacia GoodPools (en wei)
  totalVolume: bigint;     // Volumen total procesado (en wei)
  uniqueBuyers: number;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const steps = 40;
    const increment = value / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {decimals > 0
        ? display.toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : display.toLocaleString("es-CO")}
    </span>
  );
}

export function ImpactCounter() {
  const [stats, setStats] = useState<ImpactStats>({
    totalTransactions: 0,
    totalImpactG: 0n,
    totalVolume: 0n,
    uniqueBuyers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImpact() {
      try {
        // Leer todos los eventos ImpactGenerated del contrato desde el bloque 0
        const logs = await publicClient.getLogs({
          address: SPLITTER_ADDRESS,
          event: SPLITTER_EVENTS_ABI[0],
          fromBlock: 0n,
          toBlock: "latest",
        });

        let totalImpactG = 0n;
        let totalVolume = 0n;
        const buyers = new Set<string>();

        for (const log of logs) {
          const args = log.args as any;
          if (!args) continue;

          const perPoolAmount: bigint = args.perPoolAmount ?? 0n;
          const poolsLength = (args.pools?.length ?? 2);
          const treasuryAmount: bigint = args.treasuryAmount ?? 0n;
          const sellerAmount: bigint = args.sellerAmount ?? 0n;

          // Total impacto = suma de todos los pools (5%)
          totalImpactG += perPoolAmount * BigInt(poolsLength);
          // Volumen total = seller(90%) + treasury(5%) + pools(5%)
          totalVolume += sellerAmount + treasuryAmount + perPoolAmount * BigInt(poolsLength);

          if (args.buyer) buyers.add(args.buyer.toLowerCase());
        }

        setStats({
          totalTransactions: logs.length,
          totalImpactG,
          totalVolume,
          uniqueBuyers: buyers.size,
        });
      } catch (e) {
        console.error("Error fetching impact:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchImpact();
  }, []);

  const impactGDisplay = parseFloat(formatUnits(stats.totalImpactG, 18));
  const volumeDisplay = parseFloat(formatUnits(stats.totalVolume, 18));

  const tiles = [
    {
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      label: "Transacciones",
      value: <AnimatedNumber value={stats.totalTransactions} />,
      color: "from-amber-500/10 to-amber-500/0 border-amber-500/20",
    },
    {
      icon: <Leaf className="w-4 h-4 text-emerald-400" />,
      label: "G$ al Pool ReFi",
      value: (
        <>
          <AnimatedNumber value={impactGDisplay} decimals={2} />
          <span className="text-xs ml-1 opacity-70">G$</span>
        </>
      ),
      color: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/20",
    },
    {
      icon: <Globe className="w-4 h-4 text-violet-400" />,
      label: "Volumen Total",
      value: (
        <>
          <AnimatedNumber value={volumeDisplay} decimals={4} />
          <span className="text-xs ml-1 opacity-70">CELO</span>
        </>
      ),
      color: "from-violet-500/10 to-violet-500/0 border-violet-500/20",
    },
    {
      icon: <Users className="w-4 h-4 text-sky-400" />,
      label: "Viajeros Únicos",
      value: <AnimatedNumber value={stats.uniqueBuyers} />,
      color: "from-sky-500/10 to-sky-500/0 border-sky-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-1">
          <Leaf size={10} /> Impacto Regenerativo en Vivo
        </span>
        <span className="text-[8px] text-muted-foreground font-mono">
          {loading ? "Leyendo blockchain..." : "Celo Mainnet ✓"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1 p-3 rounded-2xl border bg-gradient-to-b ${tile.color} backdrop-blur-sm`}
          >
            <div className="flex items-center gap-1.5">
              {tile.icon}
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                {tile.label}
              </span>
            </div>
            {loading ? (
              <div className="h-5 w-16 rounded-md bg-white/5 animate-pulse" />
            ) : (
              <div className="text-base font-black text-foreground flex items-baseline">
                {tile.value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
