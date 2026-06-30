import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CatalogListSkeleton } from "@/components/catalogos/CatalogListSkeleton";
import { EmisorasData } from "@/components/catalogos/EmisorasData";

export const metadata = {
  title: "Emisoras",
};

export default function EmisorasPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <Suspense fallback={<CatalogListSkeleton />}>
          <EmisorasData />
        </Suspense>
      </div>
    </AppShell>
  );
}
