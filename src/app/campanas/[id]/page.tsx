import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CampanaDetalleData } from "@/components/campanas/CampanaDetalleData";
import { CampanasListSkeleton } from "@/components/campanas/CampanasListSkeleton";

export const metadata = {
  title: "Detalle de campaña | Kompensa",
};

interface CampanaDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function CampanaDetallePage({
  params,
}: CampanaDetallePageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <Suspense fallback={<CampanasListSkeleton />}>
          <CampanaDetalleData id={id} />
        </Suspense>
      </div>
    </AppShell>
  );
}
