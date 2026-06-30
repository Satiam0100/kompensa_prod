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
    </>
  );
}
