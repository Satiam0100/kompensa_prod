export const navItems = [
  {
    href: "/ordenes/nueva",
    icon: "description",
    label: "Formulario",
    match: (path: string) => path === "/ordenes/nueva" || path === "/",
  },
  {
    href: "/ordenes",
    icon: "library_music",
    label: "Cuñas registradas",
    match: (path: string) => path === "/ordenes",
  },
  {
    href: "/campanas",
    icon: "search",
    label: "Monitoreo",
    match: (path: string) => path.startsWith("/campanas"),
  },
  {
    href: "/agencias",
    icon: "business",
    label: "Agencias",
    match: (path: string) => path.startsWith("/agencias"),
  },
  {
    href: "/emisoras",
    icon: "radio",
    label: "Emisoras",
    match: (path: string) => path.startsWith("/emisoras"),
  },
  {
    href: "/reconocimiento",
    icon: "settings_input_antenna",
    label: "Reconocimiento",
    match: (path: string) => path.startsWith("/reconocimiento"),
  },
] as const;

export function navLinkClass(active: boolean) {
  return active
    ? "flex items-center gap-3 px-3 py-2 bg-primary-container text-on-primary-container font-bold rounded-lg transition-colors duration-150"
    : "flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors duration-150";
}
