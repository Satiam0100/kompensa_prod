import { AppShell } from "@/components/layout/AppShell";
import { TransmissionOrderForm } from "@/components/ordenes/TransmissionOrderForm";

export const metadata = {
  title: "Nueva Orden de Transmisión | AdCertify Pro",
};

export default function NuevaOrdenPage() {
  return (
    <AppShell topBarTitle="Formulario de nueva orden de transmisión">
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

        <TransmissionOrderForm />
      </div>
    </AppShell>
  );
}
