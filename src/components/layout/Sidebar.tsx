"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { ThemeSettingsButton } from "@/components/theme/ThemeSettingsButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const navItems = [
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
] as const;

function navLinkClass(active: boolean) {
  return active
    ? "flex items-center gap-3 px-3 py-2 bg-primary-container text-on-primary-container font-bold rounded-lg transition-colors duration-150"
    : "flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors duration-150";
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-full py-8 px-4 gap-6 bg-surface-container-low border-r border-outline-variant w-64 shrink-0">
      <div className="flex items-center gap-3 mb-2 px-2">
        <Image
          src="/kompensa-logo.jpeg"
          alt="Kompensa Logo"
          width={40}
          height={40}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-headline-sm font-extrabold text-primary leading-none">
            Kompensa
          </h1>
          <p className="text-label-sm text-on-surface-variant opacity-70">
            V2.4.8 (Active)
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navLinkClass(item.match(pathname))}
          >
            <MaterialIcon name={item.icon} />
            <span className="text-label-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <ThemeSettingsButton />
      <LogoutButton />
    </aside>
  );
}
