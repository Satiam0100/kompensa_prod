import {
  RESOLVED_THEME_COOKIE,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
} from "./types";

export function getResolvedThemeFromCookie(
  value: string | undefined,
): ResolvedTheme | null {
  if (value === "light" || value === "dark") return value;
  return null;
}

/** Script bloqueante en <head>: aplica tema antes del paint y sincroniza cookie. */
export function buildThemeInitScript(): string {
  const storageKey = THEME_STORAGE_KEY;
  const cookieKey = RESOLVED_THEME_COOKIE;

  return `(function(){try{var sk=${JSON.stringify(storageKey)};var ck=${JSON.stringify(cookieKey)};var stored=localStorage.getItem(sk);var mode=stored==="light"||stored==="dark"||stored==="system"?stored:"system";var dark=mode==="dark"||(mode==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var resolved=dark?"dark":"light";document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=resolved;document.cookie=ck+"="+resolved+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}})();`;
}

export function setResolvedThemeCookie(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.cookie = `${RESOLVED_THEME_COOKIE}=${resolved};path=/;max-age=31536000;SameSite=Lax`;
}
