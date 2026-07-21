"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyThemeMode,
  getStoredThemeMode,
  resolveTheme,
} from "@/lib/theme/apply";
import {
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeMode,
} from "@/lib/theme/types";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialResolved?: ResolvedTheme;
}

export function ThemeProvider({
  children,
  initialResolved = "light",
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>(initialResolved);

  const sync = useCallback((nextMode: ThemeMode) => {
    applyThemeMode(nextMode);
    setResolved(resolveTheme(nextMode));
  }, []);

  useLayoutEffect(() => {
    const stored = getStoredThemeMode();
    setModeState(stored);
    sync(stored);
  }, [sync]);

  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      if (getStoredThemeMode() === "system") {
        sync("system");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [sync]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      setModeState(next);
      sync(next);
    },
    [sync],
  );

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
