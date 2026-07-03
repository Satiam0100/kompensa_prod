import { ActivaBadge } from "@/components/catalogos/ActivaBadge";
import { panelCardClass } from "@/components/ui/card-classes";
import { formatFecha } from "@/lib/format";
import { formatTelefonoForDisplay } from "@/lib/normalize-telefono";
import type { AgenciaRow } from "@/lib/types/catalogo";

interface AgenciaDetalleViewProps {
  agencia: AgenciaRow;
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

function parseClientes(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((cliente) => cliente.trim())
    .filter(Boolean);
}

export function AgenciaDetalleView({ agencia }: AgenciaDetalleViewProps) {
  const telefono = agencia.telefono
    ? formatTelefonoForDisplay(agencia.telefono)
    : null;
  const clientes = parseClientes(agencia.clientes);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <ActivaBadge activa={agencia.activa} />
      </div>

      <DetalleSection title="Datos generales">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Nombre" value={agencia.nombre} />
          <DetalleField label="Dirección" value={agencia.direccion} />
        </dl>
      </DetalleSection>

      <DetalleSection title="Clientes">
        {clientes.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            Sin clientes registrados.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {clientes.map((cliente) => (
              <li
                key={cliente}
                className="inline-flex rounded-md bg-surface-container-high border border-outline-variant px-2.5 py-1 text-label-sm text-on-surface"
              >
                {cliente}
              </li>
            ))}
          </ul>
        )}
      </DetalleSection>

      <DetalleSection title="Contacto">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetalleField label="Email" value={agencia.email} />
          <DetalleField label="Teléfono" value={telefono} mono />
        </dl>
      </DetalleSection>

      {agencia.notas?.trim() && (
        <DetalleSection title="Notas">
          <p className="text-body-sm text-on-surface whitespace-pre-wrap">
            {agencia.notas}
          </p>
        </DetalleSection>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-label-sm text-on-surface-variant px-1">
        <DetalleField label="Registro" value={formatFecha(agencia.created_at)} />
        <DetalleField
          label="Última actualización"
          value={formatFecha(agencia.updated_at)}
        />
      </dl>
    </div>
  );
}
