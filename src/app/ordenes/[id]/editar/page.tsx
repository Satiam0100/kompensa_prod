import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerOrdenTransmision } from "@/app/actions/ordenes";
import { AppShell } from "@/components/layout/AppShell";
import { TransmissionOrderForm } from "@/components/ordenes/TransmissionOrderForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata = {
  title: "Editar orden | Kompensa",
};

interface EditarOrdenPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarOrdenPage({ params }: EditarOrdenPageProps) {
  const { id } = await params;
  const result = await obtenerOrdenTransmision(id);

  if (!result.success) {
    notFound();
  }

  const orden = result.data;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8 pb-16">
        <div className="mb-8">
          <Link
            href="/ordenes"
            className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary mb-4"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            Volver a cuñas registradas
          </Link>
          <h2 className="text-display-lg text-on-surface mb-2">
            Editar cuña
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            {orden.cliente} — {orden.campaña}
          </p>
        </div>

        <TransmissionOrderForm orden={orden} />
      </div>
    </AppShell>
  );
}
