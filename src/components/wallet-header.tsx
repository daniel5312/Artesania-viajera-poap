"use client";

import { useState } from "react";
import {
  Wallet,
  Copy,
  Check,
  Sun,
  Moon,
  Languages,
  LogIn,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { t } from "@/lib/i18n";
import { usePrivy } from "@privy-io/react-auth";
// 🟢 Importamos Hooks de Wagmi y Navigation
import { useAccount, useDisconnect } from "wagmi";
import { usePathname } from "next/navigation";

export function WalletHeader() {
  const [copied, setCopied] = useState(false);
  const { isDarkMode, toggleTheme, lang, toggleLang } = useTheme();
  const pathname = usePathname();

  // 🟢 DETECTOR DE RUTA: ¿Estamos en MiniPay?
  const isMiniPayRoute = pathname?.includes("/minipay");

  // 🟢 DATOS DE PRIVY (Para Vercel/Web normal)
  const {
    login,
    logout: logoutPrivy,
    authenticated: authPrivy,
    user,
  } = usePrivy();

  // 🟢 DATOS DE WAGMI (Para MiniPay)
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();

  // 🟢 LÓGICA HÍBRIDA: Elegimos qué mostrar según la ruta
  const authenticated = isMiniPayRoute ? authWagmi : authPrivy;
  const walletAddress = isMiniPayRoute ? wagmiAddress : user?.wallet?.address;

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  function handleCopy() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogout() {
    if (isMiniPayRoute) disconnectWagmi();
    else logoutPrivy();
  }

  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
          <span className="text-sm font-black text-primary">AV</span>
        </div>
        <h1 className="text-sm font-black tracking-tight text-foreground">
          {t(lang, "header.title")}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleLang}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Languages className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {isDarkMode ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>

        {authenticated ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span className="font-mono font-bold">{shortAddress}</span>
              {copied ? (
                <Check className="h-3 w-3 text-teal-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* 🟢 MAGIA FINAL: En MiniPay no renderizamos el botón si no está conectado, 
             porque useAutoConnect hará el trabajo en el fondo. */
          !isMiniPayRoute && (
            <button
              onClick={login}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5" />
              Conectar
            </button>
          )
        )}
      </div>
    </header>
  );
}
