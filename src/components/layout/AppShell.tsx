import { type ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-grow min-w-0 h-full">
        <MobileNav />
        <main className="flex-grow overflow-y-auto custom-scrollbar bg-background min-h-0">
          {children}
        </main>
      </div>
    </>
  );
}
