import { THEME_STORAGE_KEY, type ResolvedTheme, type ThemeMode } from "./types";

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyResolvedTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function applyThemeMode(mode: ThemeMode) {
  applyResolvedTheme(resolveTheme(mode));
}

/** Mantener alineado con `public/theme-init.js` (script bloqueante en layout). */
