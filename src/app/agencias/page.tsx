import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AgenciasData } from "@/components/catalogos/AgenciasData";
import { CatalogListSkeleton } from "@/components/catalogos/CatalogListSkeleton";

export const metadata = {
  title: "Agencias | Kompensa",
};

export default function AgenciasPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <Suspense fallback={<CatalogListSkeleton />}>
          <AgenciasData />
        </Suspense>
      </div>
    </AppShell>
  );
}
