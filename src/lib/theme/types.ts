export type ThemeMode = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "kompensa-theme";

/** Cookie leída en el servidor para la clase `dark` en `<html>`. */
export const RESOLVED_THEME_COOKIE = "kompensa-resolved";
