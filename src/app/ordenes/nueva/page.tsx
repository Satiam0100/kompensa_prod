import { AppShell } from "@/components/layout/AppShell";
import { TransmissionOrderForm } from "@/components/ordenes/TransmissionOrderForm";
import { listarAgencias, listarEmisoras } from "@/app/actions/catalogos";

export const metadata = {
  title: "Nueva Orden de Transmisión",
};

export default async function NuevaOrdenPage() {
  const [emisorasResult, agenciasResult] = await Promise.all([
    listarEmisoras(),
    listarAgencias(),
  ]);

  const catalogError =
    !emisorasResult.success || !agenciasResult.success
      ? [
          !emisorasResult.success ? emisorasResult.error : null,
          !agenciasResult.success ? agenciasResult.error : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-8">
        <div className="mb-6 md:mb-10">
          <h1 className="text-display-lg text-on-surface mb-2">
            Nueva Orden de Transmisión
          </h1>
          <p className="text-body-md md:text-body-lg text-on-surface-variant">
            Completa los datos de la campaña y añade una o más emisoras. Se
            registrará una orden por cada emisora.
          </p>
          <p className="text-label-sm text-on-surface-variant mt-3">
            <span className="text-tertiary">*</span> Campos obligatorios
          </p>
        </div>

        <TransmissionOrderForm
          emisoras={emisorasResult.success ? emisorasResult.data : []}
          agencias={agenciasResult.success ? agenciasResult.data : []}
          catalogError={catalogError}
        />
      </div>
    </AppShell>
  );
}
