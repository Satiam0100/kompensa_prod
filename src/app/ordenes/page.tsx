import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OrdenesData } from "@/components/ordenes/OrdenesData";
import { OrdenesSuccessStatus } from "@/components/ordenes/OrdenesSuccessStatus";
import { OrdenesListSkeleton } from "@/components/ordenes/OrdenesListSkeleton";

export const metadata = {
  title: "Cuñas Registradas",
};

export default function OrdenesPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <Suspense fallback={null}>
          <OrdenesSuccessStatus />
        </Suspense>
        <Suspense fallback={<OrdenesListSkeleton />}>
          <OrdenesData />
        </Suspense>
      </div>
    </AppShell>
  );
}
