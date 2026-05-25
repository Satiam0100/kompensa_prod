import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopAppBar } from "./TopAppBar";

interface AppShellProps {
  children: ReactNode;
  topBarTitle: string;
  topBarSubtitle?: string;
}

export function AppShell({
  children,
  topBarTitle,
  topBarSubtitle,
}: AppShellProps) {
  return (
    <>
      <Sidebar />
      <main className="flex-grow overflow-y-auto custom-scrollbar bg-background">
        <TopAppBar title={topBarTitle} subtitle={topBarSubtitle} />
        {children}
      </main>
    </>
  );
}
