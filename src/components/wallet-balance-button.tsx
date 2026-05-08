"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther, formatUnits, getAddress } from "viem";
import { celo } from "viem/chains";
import { Wallet } from "lucide-react";

const G_DOLLAR_ADDRESS = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A";
const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export function WalletBalanceButton({ onOpen }: { onOpen: () => void }) {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const address = wagmiAddress || user?.wallet?.address;

  const [bals, setBals] = useState({ cusd: "0.00", celo: "0.00", gd: "0.00" });

  useEffect(() => {
    if (!address) return;
    const fetchBals = async () => {
      const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
      const abi = [{ type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" }] as const;
      
      try {
        const [celoBal, cusdBal, gdBal] = await Promise.all([
          publicClient.getBalance({ address: address as `0x${string}` }).catch(() => 0n),
          publicClient.readContract({ address: getAddress(CUSD_ADDRESS), abi, functionName: "balanceOf", args: [address as `0x${string}`] }).catch(() => 0n),
          publicClient.readContract({ address: getAddress(G_DOLLAR_ADDRESS), abi, functionName: "balanceOf", args: [address as `0x${string}`] }).catch(() => 0n),
        ]);
        setBals({
          celo: parseFloat(formatEther(celoBal as bigint)).toFixed(2),
          cusd: parseFloat(formatEther(cusdBal as bigint)).toFixed(2),
          gd: parseFloat(formatUnits(gdBal as bigint, 18)).toFixed(0),
        });
      } catch (e) {}
    };
    fetchBals();
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
          <span className="text-emerald-100">{bals.gd} G$</span>
        </div>
      </div>
    </button>
  );
}
