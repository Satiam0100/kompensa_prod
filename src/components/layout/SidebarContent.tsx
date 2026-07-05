"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { navItems, navLinkClass } from "@/components/layout/nav-items";
import { ThemeSettingsButton } from "@/components/theme/ThemeSettingsButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface SidebarContentProps {
  onNavigate?: () => void;
  logoPriority?: boolean;
}

export function SidebarContent({
  onNavigate,
  logoPriority = false,
}: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-3 mb-2 px-2">
        <Image
          src="/kompensa-logo.jpeg"
          alt="Kompensa Logo"
          width={40}
          height={40}
          priority={logoPriority}
          loading={logoPriority ? "eager" : "lazy"}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <span className="text-headline-sm font-extrabold text-primary leading-none">
          Kompensa
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={navLinkClass(item.match(pathname))}
          >
            <MaterialIcon name={item.icon} />
            <span className="text-label-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <ThemeSettingsButton />
      <LogoutButton />

      <p className="px-2 pt-1 text-label-sm text-on-surface-variant">
        <Link
          href="/privacidad"
          className="text-primary underline underline-offset-2 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Política de Privacidad
        </Link>
      </p>
    </>
  );
}
