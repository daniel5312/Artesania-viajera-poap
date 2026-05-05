"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { celo } from "viem/chains";

// Dirección del contrato G$ en Celo Mainnet
const GDOLLAR_TOKEN_ADDRESS = "0x62B8B11039fcfE5aB0C56E502b1C372A3d2a9C7A";

type ViewState = "vitrina" | "dashboard_artista" | "dashboard_turista" | "admin";

interface GlobalContextProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  // Identidad Inferida (Bypass FaceTec)
  isVerified: boolean;
  isCheckingIdentity: boolean;
  // Billetera Activa (Wagmi o Privy dependiendo de si es Minipay)
  activeAddress: `0x${string}` | undefined;
  isConnected: boolean;
  userRole: "turista" | "artesano" | null;
  setUserRole: (role: "turista" | "artesano" | null) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>("vitrina");
  const [userRole, setUserRole] = useState<"turista" | "artesano" | null>(null);

  // Wallets A: Privy (Social Login) y Wagmi (Minipay)
  const { authenticated: authPrivy, user } = usePrivy();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();

  // Detectar ambiente de MiniPay
  const isMiniPay = typeof window !== "undefined" && !!(window as any).ethereum?.isMiniPay;

  const isConnected = isMiniPay ? authWagmi : authPrivy;
  const activeAddress = (isMiniPay ? wagmiAddress : user?.wallet?.address) as `0x${string}` | undefined;

  // Lógica de Identidad Inferida (Bypass FaceTec):
  // Si tiene saldo G$, asumimos que es una persona real
  const { data: gDollarBalance, isLoading: isCheckingIdentity } = useBalance({
    address: activeAddress,
    token: GDOLLAR_TOKEN_ADDRESS,
    query: {
      enabled: !!activeAddress,
    }
  });

  const isVerified = (gDollarBalance?.value || 0n) > 0n;

  // Rehidratación asíncrona segura (evitamos if (!mounted) return null para proveedores)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar rol inicial basado en si se conecta
  useEffect(() => {
    if (isConnected && !userRole) {
      // Por defecto a turista, la app puede cambiar esto luego
      setUserRole("turista");
    }
  }, [isConnected, userRole]);

  return (
    <GlobalContext.Provider
      value={{
        currentView,
        setCurrentView,
        isVerified,
        isCheckingIdentity,
        activeAddress,
        isConnected,
        userRole,
        setUserRole,
      }}
    >
      {/* Retornar children siempre, incluso antes de montar, para evitar Hydration Mismatch masivo, pero renderizamos null si hay hooks de UI que requieran hidratación */}
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal debe ser usado dentro de un GlobalProvider");
  }
  return context;
}
