import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CatalogListSkeleton } from "@/components/catalogos/CatalogListSkeleton";
import { EmisorasData } from "@/components/catalogos/EmisorasData";

export const metadata = {
  title: "Emisoras | Kompensa",
};

export default function EmisorasPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <div className="mb-8">
          <h2 className="text-display-lg text-on-surface mb-2">Emisoras</h2>
          <p className="text-body-lg text-on-surface-variant">
            Catálogo de emisoras y canales de radio disponibles en el sistema.
          </p>
        </div>

        <Suspense fallback={<CatalogListSkeleton />}>
          <EmisorasData />
        </Suspense>
      </div>
    </AppShell>
  );
}
