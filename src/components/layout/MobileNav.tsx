"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarContent } from "@/components/layout/SidebarContent";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-outline-variant bg-surface-container-low shrink-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <MaterialIcon name="menu" className="text-[22px]" />
        </button>
        <Image
          src="/kompensa-logo.jpeg"
          alt="Kompensa Logo"
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg object-cover"
        />
        <span className="text-headline-sm font-extrabold text-primary leading-none">
          Kompensa
        </span>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex flex-col h-full w-[min(100%,16rem)] py-6 px-4 gap-6 bg-surface-container-low border-r border-outline-variant shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 inline-flex items-center justify-center p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              aria-label="Cerrar menú"
            >
              <MaterialIcon name="close" className="text-[20px]" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
