"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther, formatUnits, getAddress } from "viem";
import { celo } from "viem/chains";
import { Wallet } from "lucide-react";
import { useGlobal } from "@/lib/global-context";

const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
const erc20Abi = [{
  type: "function", name: "balanceOf",
  inputs: [{ name: "account", type: "address" }],
  outputs: [{ name: "", type: "uint256" }],
  stateMutability: "view",
}] as const;

export function WalletBalanceButton({ onOpen }: { onOpen: () => void }) {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const address = (wagmiAddress ?? user?.wallet?.address) as `0x${string}` | undefined;

  // G$ comes from the global context (already synced from on-chain)
  const { gDollarFormatted } = useGlobal();

  const [bals, setBals] = useState({ cusd: "0.00", celo: "0.00" });

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const addr = address as `0x${string}`;
        const [celoBal, cusdBal] = await Promise.all([
          publicClient.getBalance({ address: addr }).catch(() => 0n),
          publicClient.readContract({ address: getAddress(CUSD_ADDRESS), abi: erc20Abi, functionName: "balanceOf", args: [addr] }).catch(() => 0n),
        ]);
        setBals({
          celo: parseFloat(formatEther(celoBal as bigint)).toFixed(2),
          cusd: parseFloat(formatEther(cusdBal as bigint)).toFixed(2),
        });
      } catch {}
    })();
  }, [address]);

  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3 py-1.5 rounded-[10px] text-white shadow-lg shadow-teal-500/20 active:scale-95 transition-all border border-white/20"
    >
      <Wallet size={16} className="opacity-90" />
      <div className="flex flex-col items-end">
        <span className="text-[13px] font-black tracking-tight leading-none mb-1.5">{bals.cusd} USDT</span>
        <div className="flex gap-2 text-[10px] font-extrabold uppercase opacity-90 leading-none">
          <span>{bals.celo} CELO</span>
          {/* G$ from global context = always in sync with Wallet A */}
          <span className="text-emerald-100">{parseFloat(gDollarFormatted).toFixed(0)} G$</span>
        </div>
      </div>
    </button>
  );
}
