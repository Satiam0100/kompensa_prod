import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OrdenesData } from "@/components/ordenes/OrdenesData";
import { OrdenesListSkeleton } from "@/components/ordenes/OrdenesListSkeleton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata = {
  title: "Cuñas Registradas | Kompensa",
};

export default function OrdenesPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-display-lg text-on-surface mb-2">
              Cuñas registradas
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Consulta todas las órdenes de transmisión guardadas en el sistema.
            </p>
          </div>
          <Link
            href="/ordenes/nueva"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <MaterialIcon name="add" />
            Nueva orden
          </Link>
        </div>

        <Suspense fallback={<OrdenesListSkeleton />}>
          <OrdenesData />
        </Suspense>
      </div>
    </AppShell>
  );
}
