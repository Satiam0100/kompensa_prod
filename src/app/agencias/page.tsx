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
        <div className="mb-8">
          <h2 className="text-display-lg text-on-surface mb-2">Agencias</h2>
          <p className="text-body-lg text-on-surface-variant">
            Catálogo de agencias de publicidad importado desde la base de datos.
          </p>
        </div>

        <Suspense fallback={<CatalogListSkeleton />}>
          <AgenciasData />
        </Suspense>
      </div>
    </AppShell>
  );
}
