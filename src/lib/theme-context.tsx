"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Lang } from "./i18n"

interface ThemeContextValue {
  isDarkMode: boolean
  toggleDarkMode: () => void
  lang: Lang
  toggleLang: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [lang, setLang] = useState<Lang>("es")

  function toggleDarkMode() {
    setIsDarkMode((prev) => !prev)
  }

  function toggleLang() {
    setLang((prev) => (prev === "es" ? "en" : "es"))
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, lang, toggleLang }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
