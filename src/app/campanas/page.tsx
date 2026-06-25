import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CampanasData } from "@/components/campanas/CampanasData";
import { CampanasListSkeleton } from "@/components/campanas/CampanasListSkeleton";

export const metadata = {
  title: "Monitoreo | Kompensa",
};

export default function CampanasPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <Suspense fallback={<CampanasListSkeleton />}>
          <CampanasData />
        </Suspense>
      </div>
    </AppShell>
  );
}
