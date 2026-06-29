import { listarCampanasConEstado } from "@/app/actions/campanas";
import { CampanasCatalog } from "@/components/campanas/CampanasCatalog";

export async function CampanasData() {
  const result = await listarCampanasConEstado();

  if (!result.success) {
    return (
      <div className="bg-error-container/20 border border-error rounded-lg p-6 text-on-error-container">
        <p className="text-body-md font-medium mb-1">
          No se pudo cargar el monitoreo
        </p>
        <p className="text-body-sm opacity-90">{result.error}</p>
      </div>
    );
  }

  return <CampanasCatalog campanas={result.data} />;
}
