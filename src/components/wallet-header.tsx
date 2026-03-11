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

export function WalletHeader() {
  const [copied, setCopied] = useState(false);
  const { isDarkMode, toggleTheme, lang, toggleLang } = useTheme();

  // 🟢 EL CEREBRO WEB3: Traemos todo de Privy
  const { login, logout, authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address as string;

  // Mostrar solo los primeros 6 y últimos 4 caracteres de la wallet
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  function handleCopy() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* 🟢 LA LÓGICA DE LOGIN / LOGOUT */}
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
              onClick={logout}
              className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5" />
            Conectar
          </button>
        )}
      </div>
    </header>
  );
}
