"use client";

import { useState, useEffect } from "react";
import { Wallet, Copy, Check, Sun, Moon, Languages, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import { usePathname } from "next/navigation";
import { useGlobal } from "@/lib/global-context";

export function WalletHeader() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isDarkMode, toggleTheme, lang, toggleLang } = useTheme();
  const { gDollarFormatted, gDollarBalance } = useGlobal();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const isMiniPayRoute = pathname?.includes("/minipay");

  const { logout: logoutPrivy, authenticated: authPrivy, user } = usePrivy();
  const { address: wagmiAddress, isConnected: authWagmi } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();

  if (!mounted) return null;

  const authenticated = authWagmi || authPrivy;
  const walletAddress = wagmiAddress ?? user?.wallet?.address;
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "";

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
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30 shadow-[0_0_10px_rgba(129,98,243,0.3)]">
          <span className="text-sm font-black text-primary">AV</span>
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-sm font-black tracking-tight text-foreground">Artesanía Viajera</h1>
          {/* G$ balance — always visible, updates every 10s */}
          {authenticated && (
            <span className={`text-[10px] font-black tabular-nums transition-all ${gDollarBalance > 0n ? "text-emerald-500" : "text-zinc-400"}`}>
              G$ {gDollarFormatted}
            </span>
          )}
        </div>
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
          {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {authenticated && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              <span className="font-mono font-bold">{shortAddress}</span>
              {copied ? <Check className="h-3 w-3 text-teal-500" /> : <Copy className="h-3 w-3" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
