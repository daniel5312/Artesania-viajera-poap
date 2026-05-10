"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, getAddress, formatUnits } from "viem";
import { celo } from "viem/chains";

// ─── Constants ───────────────────────────────────────────────────────────
const GDOLLAR_TOKEN_ADDRESS = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A";
const ROLE_STORAGE_KEY = "artesania_user_role";

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

const erc20Abi = [{
  type: "function",
  name: "balanceOf",
  inputs: [{ name: "account", type: "address" }],
  outputs: [{ name: "", type: "uint256" }],
  stateMutability: "view",
}] as const;

// ─── Types ───────────────────────────────────────────────────────────────
export type UserRole = "turista" | "artesano";
type ViewState = "vitrina" | "dashboard_artista" | "dashboard_turista" | "admin";

interface GlobalContextProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isVerified: boolean;
  activeAddress: `0x${string}` | undefined;
  isConnected: boolean;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  // G$ — single source of truth, polled every 10s
  gDollarBalance: bigint;
  gDollarFormatted: string;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────
export function GlobalProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewState>("vitrina");
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [gDollarBalance, setGDollarBalance] = useState<bigint>(0n);

  const { authenticated: authPrivy, user } = usePrivy();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();

  // Prefer wagmi (MiniPay) address, fall back to Privy
  const activeAddress = (wagmiAddress ?? user?.wallet?.address) as `0x${string}` | undefined;
  const isConnected = authWagmi || authPrivy;
  const isVerified = gDollarBalance > 0n;
  const gDollarFormatted = parseFloat(formatUnits(gDollarBalance, 18)).toFixed(2);

  // ── Role persistence
  const setUserRole = (role: UserRole | null) => {
    setUserRoleState(role);
    if (typeof window !== "undefined") {
      if (role) localStorage.setItem(ROLE_STORAGE_KEY, role);
      else localStorage.removeItem(ROLE_STORAGE_KEY);
    }
  };

  // ── Restore role from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (saved) setUserRoleState(saved);
  }, []);

  // ── Set default role to turista if connected but no role
  useEffect(() => {
    if (isConnected && !userRole) {
      const saved = typeof window !== "undefined"
        ? (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null)
        : null;
      setUserRoleState(saved ?? "turista");
    }
  }, [isConnected, userRole]);

  // ── Poll G$ balance every 10s — no useCallback, direct async in useEffect
  useEffect(() => {
    if (!activeAddress) {
      setGDollarBalance(0n);
      return;
    }

    let cancelled = false;

    const fetchG = async () => {
      try {
        const bal = await publicClient.readContract({
          address: getAddress(GDOLLAR_TOKEN_ADDRESS) as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [activeAddress],
        });
        if (!cancelled) {
          console.log("[GlobalContext] G$ balance:", bal?.toString());
          setGDollarBalance(bal as bigint);
        }
      } catch (e) {
        console.error("[GlobalContext] G$ fetch error:", e);
      }
    };

    // Fetch immediately
    fetchG();
    // Then every 10 seconds
    const interval = setInterval(fetchG, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]);

  return (
    <GlobalContext.Provider
      value={{
        currentView, setCurrentView,
        isVerified,
        activeAddress, isConnected,
        userRole, setUserRole,
        gDollarBalance, gDollarFormatted,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) throw new Error("useGlobal debe ser usado dentro de un GlobalProvider");
  return context;
}
