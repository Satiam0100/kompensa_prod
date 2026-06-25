import Link from "next/link";
import { CumplimientoBadge } from "@/components/campanas/CumplimientoBadge";
import { ProgresoCampana } from "@/components/campanas/ProgresoCampana";
import { EstadoBadge } from "@/components/ordenes/EstadoBadge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RESPONSIVE_CARD_GRID_CLASS } from "@/components/ui/responsive-card-grid";
import { formatFecha, formatPeriodo } from "@/lib/format";
import type { CampanaConEstado } from "@/lib/types/campana-estado";

export { RESPONSIVE_CARD_GRID_CLASS as CAMPANAS_GRID_CLASS };

interface CampanaCardProps {
  campana: CampanaConEstado;
}

export function CampanaCard({ campana }: CampanaCardProps) {
  const { metricas, resumen } = campana;

  return (
    <Link
      href={`/campanas/${campana.id}`}
      className="block bg-surface-container border border-outline-variant rounded-lg p-4 space-y-3 hover:bg-surface-container-high/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="text-body-md font-medium text-on-surface truncate">
            {campana.cliente}
          </p>
          <p className="text-body-sm text-on-surface-variant truncate">
            {campana.campaña}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <CumplimientoBadge
            estado={campana.estado_cumplimiento}
            sinMonitoreo={metricas.sin_monitoreo}
          />
          <EstadoBadge estado={campana.estado} />
        </div>
      </div>

      <div className="space-y-1 text-label-sm text-on-surface-variant">
        <p>
          <MaterialIcon
            name="radio"
            className="text-sm mr-1 text-outline-variant align-middle"
          />
          {campana.emisora}
          {campana.ciudad && (
            <span className="text-on-surface-variant"> · {campana.ciudad}</span>
          )}
        </p>
        <p>{formatPeriodo(campana.periodo_inicio, campana.periodo_fin)}</p>
      </div>

      <ProgresoCampana
        transmitidas={metricas.transmitidas_acumuladas}
        total={metricas.total_contratadas}
        porcentaje={metricas.porcentaje_cumplimiento}
        sinMonitoreo={metricas.sin_monitoreo}
      />

      <div className="flex justify-between items-center pt-1 border-t border-outline-variant/40 text-label-sm text-on-surface-variant">
        <span>
          Día {metricas.dias_transcurridos} de {metricas.dias_totales_campana}
        </span>
        {resumen ? (
          <span>Actualizado {formatFecha(resumen.fecha)}</span>
        ) : (
          <span className="text-on-surface-variant/70">Sin ejecución Flujo B</span>
        )}
      </div>
    </Link>
  );
}
