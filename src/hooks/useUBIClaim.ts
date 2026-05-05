"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http, getAddress, parseAbi } from "viem";
import { celo } from "viem/chains";
import { ClaimSDK, IdentitySDK } from "@goodsdks/citizen-sdk";
import { usePrivy } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const UBI_SCHEME_ADDRESS = "0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1";

const ubiSchemeABI = [
  {
    inputs: [{ internalType: "address", name: "_member", type: "address" }],
    name: "checkEntitlement",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "periodStart",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentDay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
] as const;

export function useUBIClaim() {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const pathname = usePathname();
  const isMiniPayRoute = pathname?.includes("/minipay");
  const address = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const [isClaiming, setIsClaiming] = useState(false);
  const [entitlement, setEntitlement] = useState<bigint>(0n);
  const [lastChecked, setLastChecked] = useState<number>(0);

  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>("Calculando...");

  // Reloj sintético local para evitar llamadas constantes al RPC
  const checkEntitlement = async (walletBAddr: string) => {
    if (!walletBAddr) return;
    
    // Throttle check to once per minute minimum
    if (Date.now() - lastChecked < 60000 && entitlement > 0n) return entitlement;

    try {
      const amount = await publicClient.readContract({
        address: UBI_SCHEME_ADDRESS,
        abi: ubiSchemeABI,
        functionName: "checkEntitlement",
        args: [getAddress(walletBAddr)],
      });
      
      setEntitlement(amount);
      setLastChecked(Date.now());

      if (amount === 0n) {
        // Calculate timer
        const now = new Date();
        const nextNoon = new Date(now);
        nextNoon.setUTCHours(12, 0, 0, 0); // GoodDollar reset time
        if (now.getTime() > nextNoon.getTime()) {
          nextNoon.setUTCDate(nextNoon.getUTCDate() + 1);
        }
        const diffMs = nextNoon.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilNextClaim(`${hours}h ${mins}m`);
      }

      return amount;
    } catch (error) {
      console.error("Error checking UBI entitlement:", error);
      setTimeUntilNextClaim("12h 0m");
      return 0n;
    }
  };

  const claimUBI = async (walletClientB: any, walletBAddress: string) => {
    if (!walletBAddress) throw new Error("Wallet B not connected");
    if (!walletClientB) throw new Error("WalletClient B no está listo.");
    
    setIsClaiming(true);
    try {
      const UBI_CONTRACT = getAddress("0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1");
      const ubiAbi = parseAbi(["function claim() returns (bool)"]);

      const tx = await walletClientB.writeContract({
        address: UBI_CONTRACT,
        abi: ubiAbi,
        functionName: "claim",
        account: getAddress(walletBAddress),
        chain: celo,
      });

      // Reiniciamos entitlement tras reclamar exitosamente (optimista)
      setEntitlement(0n);
      return { success: true, hash: tx };
    } catch (error: any) {
      console.error("Error claiming UBI:", error);
      return { success: false, error: error.message };
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    checkEntitlement,
    claimUBI,
    isClaiming,
    entitlement,
    timeUntilNextClaim,
    hasClaim: entitlement > 0n
  };
}
