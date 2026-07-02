import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { panelCardClass } from "@/components/ui/card-classes";
import { formatFecha } from "@/lib/format";
import { formatTelefonoForDisplay } from "@/lib/normalize-telefono";
import type { EmisoraRow } from "@/lib/types/catalogo";

interface EmisoraDetalleViewProps {
  emisora: EmisoraRow;
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

export function EmisoraDetalleView({ emisora }: EmisoraDetalleViewProps) {
  const telefono = emisora.whatsapp
    ? formatTelefonoForDisplay(emisora.whatsapp)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <ActivaBadge activa={emisora.activa} />
      </div>

      <DetalleSection title="Datos generales">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Nombre" value={emisora.nombre} />
          <DetalleField label="Ciudad" value={emisora.ciudad} />
          <DetalleField label="Channel ID" value={emisora.channel_id} mono />
          <DetalleField label="Circuito" value={emisora.circuito} />
          <DetalleField label="Tipo" value={emisora.tipo} />
        </dl>
      </DetalleSection>

      <DetalleSection title="Contacto">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Contacto" value={emisora.contacto} />
          <DetalleField label="Email" value={emisora.email} />
          <DetalleField label="Teléfono" value={telefono} mono />
        </dl>
      </DetalleSection>

      {emisora.notas?.trim() && (
        <DetalleSection title="Notas">
          <p className="text-body-sm text-on-surface whitespace-pre-wrap">
            {emisora.notas}
          </p>
        </DetalleSection>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-label-sm text-on-surface-variant px-1">
        <DetalleField label="Registro" value={formatFecha(emisora.created_at)} />
        <DetalleField
          label="Última actualización"
          value={formatFecha(emisora.updated_at)}
        />
      </dl>
    </div>
  );
}
