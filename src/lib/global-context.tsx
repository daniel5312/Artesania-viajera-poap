"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, getAddress, formatUnits } from "viem";
import { celo } from "viem/chains";
import { BADGE_ADDRESS, BADGE_ABI } from "@/constants/abis/ArtesaniaBadgeABI";

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

  // ── 🏆 ENFOQUE 100% WEB3: Check On-Chain de Credencial NFT
  useEffect(() => {
    if (!activeAddress) return;

    const checkWeb3Identity = async () => {
      try {
        // Asumimos que el ID de la credencial maestra de artesano es 1 o 999.
        // Consultamos el saldo del usuario en el contrato ERC-1155.
        const balance = await publicClient.readContract({
          address: getAddress(BADGE_ADDRESS) as `0x${string}`,
          abi: BADGE_ABI,
          functionName: "balanceOf",
          args: [activeAddress, 1n], // Revisa si tiene el token ID 1
        });

        if ((balance as bigint) > 0n) {
          console.log("🏆 Identidad Web3 Confirmada: El usuario posee la Credencial de Artesano NFT.");
          setUserRole("artesano");
        } else {
          console.log("ℹ️ No se detectó Credencial NFT. Se mostrará el Onboarding o se usará el caché.");
          // No forzamos turista para permitir que el Onboarding manual funcione en la Hackathon.
        }
      } catch (error) {
        console.error("Error consultando la identidad Web3:", error);
      }
    };

    checkWeb3Identity();
  }, [activeAddress]);

  // We do NOT set a default role anymore. If it's null, the AppShell will show the Onboarding screen.
  
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
