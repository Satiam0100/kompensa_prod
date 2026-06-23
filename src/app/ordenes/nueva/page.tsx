import { AppShell } from "@/components/layout/AppShell";
import { TransmissionOrderForm } from "@/components/ordenes/TransmissionOrderForm";
import { listarAgencias, listarEmisoras } from "@/app/actions/catalogos";

export const metadata = {
  title: "Nueva Orden de Transmisión | AdCertify Pro",
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
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-10">
          <h2 className="text-display-lg text-on-surface mb-2">
            Nueva Orden de Transmisión
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Completa los datos para registrar un nuevo contrato publicitario en
            el motor de verificación.
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
