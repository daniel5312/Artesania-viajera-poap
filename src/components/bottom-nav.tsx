"use client"

import { Fingerprint, ShoppingBag, Users, Sparkles, Box } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { t } from "@/lib/i18n"

type Tab = "pasaporte" | "tienda" | "comunidad" | "momentos" | "coleccion"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; labelKey: string; icon: any }[] = [
  { id: "pasaporte", labelKey: "nav.pasaporte", icon: Fingerprint },
  { id: "coleccion", labelKey: "nav.coleccion", icon: Box },
  { id: "tienda", labelKey: "nav.tienda", icon: ShoppingBag },
  { id: "momentos", labelKey: "nav.momentos", icon: Sparkles },
  { id: "comunidad", labelKey: "nav.comunidad", icon: Users },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { isDarkMode, lang } = useTheme()

  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t backdrop-blur-xl ${
        isDarkMode
          ? "border-border/50 bg-background/80"
          : "border-border/40 bg-background/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      }`}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={t(lang, tab.labelKey)}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 transition-all ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-[10px] font-medium">{t(lang, tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
