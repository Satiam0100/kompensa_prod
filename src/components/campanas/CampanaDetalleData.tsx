import { notFound } from "next/navigation";
import { obtenerCampanaDetalle } from "@/app/actions/campanas";
import { CampanaDetalleView } from "@/components/campanas/CampanaDetalleView";

interface CampanaDetalleDataProps {
  id: string;
}

export async function CampanaDetalleData({ id }: CampanaDetalleDataProps) {
  const result = await obtenerCampanaDetalle(id);

  if (!result.success) {
    if (result.error === "Campaña no encontrada") {
      notFound();
    }
    return (
      <div className="bg-error-container/20 border border-error rounded-lg p-6 text-on-error-container">
        <p className="text-body-md font-medium mb-1">Error al cargar</p>
        <p className="text-body-sm opacity-90">{result.error}</p>
      </div>
    );
  }

  return <CampanaDetalleView campana={result.data} />;
}
