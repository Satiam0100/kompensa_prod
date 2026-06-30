import { listarAgencias, listarEmisoras } from "@/app/actions/catalogos";
import { listarOrdenesTransmision } from "@/app/actions/ordenes";
import { OrdenesCatalog } from "@/components/ordenes/OrdenesCatalog";

export async function OrdenesData() {
  const [ordenesResult, emisorasResult, agenciasResult] = await Promise.all([
    listarOrdenesTransmision(),
    listarEmisoras(),
    listarAgencias(),
  ]);

  if (!ordenesResult.success) {
    return (
      <div className="bg-error-container/20 border border-error rounded-lg p-6 text-on-error-container">
        <p className="text-body-md font-medium mb-1">
          No se pudieron cargar las órdenes
        </p>
        <p className="text-body-sm opacity-90">{ordenesResult.error}</p>
        <p className="text-label-sm mt-3 text-on-surface-variant">
          Si el problema persiste, contacta al administrador del sistema.
        </p>
      </div>
    );
  }

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
    <OrdenesCatalog
      ordenes={ordenesResult.data}
      emisoras={emisorasResult.success ? emisorasResult.data : []}
      agencias={agenciasResult.success ? agenciasResult.data : []}
      catalogError={catalogError}
    />
  );
}
