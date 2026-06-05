import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Sidebar />
      <main className="flex-grow overflow-y-auto custom-scrollbar bg-background">
        {children}
      </main>
    </>
  );
}
