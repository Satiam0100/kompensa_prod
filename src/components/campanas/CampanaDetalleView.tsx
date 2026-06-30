import Link from "next/link";
import { panelCardClass } from "@/components/ui/card-classes";
import { CumplimientoBadge } from "@/components/campanas/CumplimientoBadge";
import { ProgresoCampana } from "@/components/campanas/ProgresoCampana";
import { EstadoBadge } from "@/components/ordenes/EstadoBadge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { formatFecha, formatPeriodo } from "@/lib/format";
import { formatPorcentaje } from "@/lib/calcular-metricas-campana";
import type { CampanaDetalle } from "@/lib/types/campana-estado";

interface CampanaDetalleViewProps {
  campana: CampanaDetalle;
}

export function CampanaDetalleView({ campana }: CampanaDetalleViewProps) {
  const { metricas, historial } = campana;
  const maxBar = Math.max(
    metricas.total_contratadas,
    ...historial.map((h) => h.transmitidas_acumuladas),
    1,
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/campanas"
          className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-tertiary transition-colors mb-4"
        >
          <MaterialIcon name="arrow_back" className="text-sm" />
          Volver al monitoreo
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-display-lg text-on-surface mb-1">
              {campana.cliente}
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {campana.campaña}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CumplimientoBadge
              estado={campana.estado_cumplimiento}
              sinMonitoreo={metricas.sin_monitoreo}
            />
            <EstadoBadge estado={campana.estado} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Transmitidas"
          value={
            metricas.sin_monitoreo ? "—" : String(metricas.transmitidas_acumuladas)
          }
          sub={`de ${metricas.total_contratadas} contratadas`}
        />
        <KpiCard
          label="Cumplimiento total"
          value={
            metricas.sin_monitoreo
              ? "—"
              : formatPorcentaje(metricas.porcentaje_cumplimiento)
          }
          sub="sobre el total de la campaña"
        />
        <KpiCard
          label="Faltantes"
          value={metricas.sin_monitoreo ? "—" : String(metricas.faltantes_total)}
          sub="hasta completar el contrato"
        />
        <KpiCard
          label="Avance temporal"
          value={`Día ${metricas.dias_transcurridos}`}
          sub={`de ${metricas.dias_totales_campana} días`}
        />
      </div>

      <section className={panelCardClass("p-5 space-y-4")}>
        <h2 className="text-title-md text-on-surface">Progreso de campaña</h2>
        <ProgresoCampana
          transmitidas={metricas.transmitidas_acumuladas}
          total={metricas.total_contratadas}
          porcentaje={metricas.porcentaje_cumplimiento}
          sinMonitoreo={metricas.sin_monitoreo}
        />
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-label-sm pt-2 border-t border-outline-variant/40">
          <div>
            <dt className="text-on-surface-variant">Emisora</dt>
            <dd className="text-on-surface">{campana.emisora}</dd>
          </div>
          {campana.ciudad && (
            <div>
              <dt className="text-on-surface-variant">Ciudad</dt>
              <dd className="text-on-surface">{campana.ciudad}</dd>
            </div>
          )}
          <div>
            <dt className="text-on-surface-variant">Periodo</dt>
            <dd className="text-on-surface">
              {formatPeriodo(campana.periodo_inicio, campana.periodo_fin)}
            </dd>
          </div>
          {campana.numero_certificado && (
            <div>
              <dt className="text-on-surface-variant">N.º certificado</dt>
              <dd className="text-label-mono text-on-surface">
                {campana.numero_certificado}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-on-surface-variant">Ritmo contratado</dt>
            <dd className="text-on-surface">
              {campana.cuñas_diarias}/día · {campana.total_contratadas} total
            </dd>
          </div>
          {campana.spot_id && (
            <div className="sm:col-span-2">
              <dt className="text-on-surface-variant">Spot ID</dt>
              <dd className="text-label-mono text-on-surface break-all">
                {campana.spot_id}
              </dd>
            </div>
          )}
        </dl>
        {campana.certificado_pdf_url && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
            {(campana.certificado_numero ?? campana.numero_certificado) && (
              <span className="text-label-mono text-label-sm text-on-surface">
                N.º{" "}
                {campana.certificado_numero ?? campana.numero_certificado}
              </span>
            )}
            <a
              href={campana.certificado_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-label-sm text-tertiary hover:brightness-110"
            >
              <MaterialIcon name="picture_as_pdf" className="text-sm" />
              Ver certificado PDF
            </a>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-title-md text-on-surface">Historial de monitoreo</h2>
        {historial.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg p-6 text-center">
            Aún no hay registros de monitoreo para esta campaña.
          </p>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-outline-variant">
              <table className="w-full text-left text-label-sm">
                <thead className="bg-surface-container-high text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Día</th>
                    <th className="px-4 py-3 font-medium">Acumulado</th>
                    <th className="px-4 py-3 font-medium">% total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {historial.map((row) => {
                    const pct =
                      (row.transmitidas_acumuladas / metricas.total_contratadas) *
                      100;
                    return (
                      <tr
                        key={row.id}
                        className="bg-surface-container hover:bg-surface-container-high/40"
                      >
                        <td className="px-4 py-3 text-on-surface">
                          {formatFecha(row.fecha)}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {row.transmitidas_dia}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {row.transmitidas_acumuladas}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatPorcentaje(pct)}
                        </td>
                        <td className="px-4 py-3">
                          <CumplimientoBadge estado={row.estado} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3">
              {historial.map((row) => {
                const pct =
                  (row.transmitidas_acumuladas / metricas.total_contratadas) *
                  100;
                return (
                  <div
                    key={row.id}
                    className={panelCardClass("p-4 space-y-2")}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm font-medium">
                        {formatFecha(row.fecha)}
                      </span>
                      <CumplimientoBadge estado={row.estado} />
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      +{row.transmitidas_dia} hoy · {row.transmitidas_acumuladas}{" "}
                      acum. · {formatPorcentaje(pct)} del total
                    </p>
                  </div>
                );
              })}
            </div>

            <div className={panelCardClass("p-5")}>
              <p className="text-label-sm text-on-surface-variant mb-4">
                Evolución del acumulado (% del total contratado)
              </p>
              <div className="flex items-end gap-1 h-32">
                {historial.map((row) => {
                  const pct =
                    (row.transmitidas_acumuladas / maxBar) * 100;
                  return (
                    <div
                      key={row.id}
                      className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full justify-end"
                      title={`${formatFecha(row.fecha)}: ${row.transmitidas_acumuladas}`}
                    >
                      <div
                        className="w-full max-w-8 mx-auto rounded-t bg-tertiary/80"
                        style={{ height: `${Math.max(4, pct)}%` }}
                      />
                      <span className="text-[10px] text-on-surface-variant truncate w-full text-center">
                        {row.fecha.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={panelCardClass("p-4")}>
      <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
      <p className="text-headline-lg-mobile text-on-surface tabular-nums">
        {value}
      </p>
      <p className="text-label-sm text-on-surface-variant/80 mt-1">{sub}</p>
    </div>
  );
}
