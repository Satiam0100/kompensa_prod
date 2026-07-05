import { panelCardClass } from "@/components/ui/card-classes";
import { EstadoBadge } from "@/components/ordenes/EstadoBadge";
import { formatFecha, formatPeriodo } from "@/lib/format";
import { resolveTramosCuotas } from "@/lib/meta-campana";
import { formatTelefonoForDisplay } from "@/lib/normalize-telefono";
import { DIAS_SEMANA_LABELS } from "@/lib/types/tramo-cuota";
import type { OrdenTransmisionRow } from "@/lib/types/orden-transmision";

interface OrdenDetalleViewProps {
  orden: OrdenTransmisionRow;
}

function DetalleField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  const display =
    value === null || value === undefined || value === ""
      ? "—"
      : String(value);

  return (
    <div>
      <dt className="text-label-sm text-on-surface-variant">{label}</dt>
      <dd
        className={`text-body-sm text-on-surface mt-0.5 ${
          mono ? "font-label-mono break-all" : ""
        }`}
      >
        {display}
      </dd>
    </div>
  );
}

function DetalleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={panelCardClass("p-5 space-y-4")}>
      <h3 className="text-title-md text-on-surface">{title}</h3>
      {children}
    </section>
  );
}

export function OrdenDetalleView({ orden }: OrdenDetalleViewProps) {
  const tramos = resolveTramosCuotas(orden);
  const telefono = orden.telefono_cliente
    ? formatTelefonoForDisplay(orden.telefono_cliente)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <EstadoBadge estado={orden.estado} />
      </div>

      <DetalleSection title="Identificación de campaña">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Cliente" value={orden.cliente} />
          <DetalleField label="Campaña" value={orden.campaña} />
          <DetalleField label="Agencia" value={orden.agencia} />
          <DetalleField label="Correo del coordinador" value={orden.email_cliente} />
          <DetalleField label="Teléfono del coordinador" value={telefono} mono />
        </dl>
      </DetalleSection>

      <DetalleSection title="Operación">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField
            label="N.º de certificado"
            value={orden.numero_certificado}
            mono
          />
        </dl>
      </DetalleSection>

      <DetalleSection title="Emisora">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Emisora" value={orden.emisora} />
          <DetalleField label="Ciudad" value={orden.ciudad} />
          <DetalleField label="Channel ID" value={orden.channel_id} mono />
        </dl>
      </DetalleSection>

      <DetalleSection title="Detalles del contrato">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField
            label="Cuñas por día (referencia)"
            value={orden.cuñas_diarias}
          />
          <DetalleField
            label="Total contratadas"
            value={orden.total_contratadas}
          />
          <DetalleField
            label="Periodo"
            value={formatPeriodo(orden.periodo_inicio, orden.periodo_fin)}
          />
          <DetalleField
            label="Horario de transmisión"
            value={orden.horario}
          />
        </dl>

        <div className="pt-2 border-t border-outline-variant/40 space-y-3">
          <h4 className="text-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
            Tramos de cuota
          </h4>
          {tramos.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Sin tramos configurados.
            </p>
          ) : (
            <div className="space-y-3">
              {tramos.map((tramo, index) => (
                <div
                  key={`${tramo.desde}-${tramo.hasta}-${index}`}
                  className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-4"
                >
                  <p className="text-label-sm font-medium text-on-surface mb-2">
                    Tramo {index + 1}
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DetalleField
                      label="Desde"
                      value={formatFecha(tramo.desde)}
                    />
                    <DetalleField
                      label="Hasta"
                      value={formatFecha(tramo.hasta)}
                    />
                    <DetalleField
                      label="Cuñas por día"
                      value={tramo.cuñas_por_dia}
                    />
                    <DetalleField
                      label="Días de la semana"
                      value={tramo.dias_semana
                        .map((dia) => DIAS_SEMANA_LABELS[dia])
                        .join(", ")}
                    />
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetalleSection>

      <DetalleSection title="Parámetros técnicos">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Spot ID" value={orden.spot_id} mono />
          <DetalleField label="Nombre del spot" value={orden.spot_name} />
          <DetalleField label="Duración (seg)" value={orden.duracion_seg} />
        </dl>
      </DetalleSection>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-label-sm text-on-surface-variant px-1">
        <DetalleField label="Registro" value={formatFecha(orden.created_at)} />
        <DetalleField
          label="Última actualización"
          value={formatFecha(orden.updated_at)}
        />
      </dl>
    </div>
  );
}
