"use client";

import { SidebarContent } from "@/components/layout/SidebarContent";

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-full py-8 px-4 gap-6 bg-surface-container-low border-r border-outline-variant w-64 shrink-0">
      <SidebarContent logoPriority />
    </aside>
  );
}
