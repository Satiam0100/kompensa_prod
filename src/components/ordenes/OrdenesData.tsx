import { listarOrdenesTransmision } from "@/app/actions/ordenes";
import { OrdenesList } from "@/components/ordenes/OrdenesList";

export async function OrdenesData() {
  const result = await listarOrdenesTransmision();

  if (!result.success) {
    return (
      <div className="bg-error-container/20 border border-error rounded-lg p-6 text-on-error-container">
        <p className="text-body-md font-medium mb-1">
          No se pudieron cargar las órdenes
        </p>
        <p className="text-body-sm opacity-90">{result.error}</p>
        <p className="text-label-sm mt-3 text-on-surface-variant">
          Revisa las variables de entorno en{" "}
          <code className="font-label-mono">.env.local</code> y la conexión a
          Supabase.
        </p>
      </div>
    );
  }

  return <OrdenesList ordenes={result.data} />;
}
