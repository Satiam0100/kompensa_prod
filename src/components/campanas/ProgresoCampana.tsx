import { formatPorcentaje } from "@/lib/calcular-metricas-campana";

interface ProgresoCampanaProps {
  transmitidas: number;
  total: number;
  porcentaje: number;
  sinMonitoreo?: boolean;
}

export function ProgresoCampana({
  transmitidas,
  total,
  porcentaje,
  sinMonitoreo = false,
}: ProgresoCampanaProps) {
  const barWidth = Math.min(100, Math.max(0, porcentaje));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline gap-2 text-label-sm">
        <span className="text-on-surface-variant">
          {sinMonitoreo ? "—" : transmitidas}
          <span className="text-on-surface-variant/70"> / {total}</span>
          <span className="text-on-surface-variant/60 ml-1">cuñas</span>
        </span>
        <span className="font-medium text-on-surface tabular-nums">
          {sinMonitoreo ? "—" : formatPorcentaje(porcentaje)}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-surface-container-highest overflow-hidden"
        role="progressbar"
        aria-valuenow={sinMonitoreo ? 0 : Math.round(porcentaje)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Cumplimiento sobre el total de la campaña"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            sinMonitoreo
              ? "bg-outline-variant/40"
              : porcentaje >= 100
                ? "bg-tertiary"
                : porcentaje >= 50
                  ? "bg-tertiary/80"
                  : "bg-on-tertiary-container"
          }`}
          style={{ width: sinMonitoreo ? "0%" : `${barWidth}%` }}
        />
      </div>
      <p className="text-label-sm text-on-surface-variant/80">
        % sobre el total contratado de la campaña
      </p>
    </div>
  );
}
