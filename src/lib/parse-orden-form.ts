import type {
  EstadoOrden,
  OrdenEmisoraLinea,
  OrdenTransmisionForm,
  OrdenTransmisionFormCompartido,
} from "@/lib/types/orden-transmision";
import { normalizeDateInputValue } from "@/components/ui/date-picker-utils";
import {
  applyEstadoSpotRules,
  validateEstadoSpotRule,
} from "@/lib/orden-estado-spot";
import {
  normalizeTelefonoCliente,
  validateTelefonoCliente,
} from "@/lib/normalize-telefono";
import { validateEmail } from "@/lib/validate-email";
import { parseTramosCuotas, resolveTramosCuotas, validarHuecosCoberturaTramos, validarTramosDentroPeriodo } from "@/lib/meta-campana";
import type { TramoCuota } from "@/lib/types/tramo-cuota";

/** Nombres ASCII en el HTML (evita problemas con ñ en FormData en algunos navegadores). */
export const ORDEN_FORM_NAMES = {
  cliente: "cliente",
  campana: "campana",
  emisora: "emisora",
  ciudad: "ciudad",
  estado: "estado",
  agencia: "agencia",
  email_cliente: "email_cliente",
  telefono_cliente: "telefono_cliente",
  channel_id: "channel_id",
  cunias_diarias: "cunias_diarias",
  total_contratadas: "total_contratadas",
  periodo_inicio: "periodo_inicio",
  periodo_fin: "periodo_fin",
  horario: "horario",
  spot_id: "spot_id",
  spot_name: "spot_name",
  duracion_seg: "duracion_seg",
  numero_certificado: "numero_certificado",
  emisora_line_count: "emisora_line_count",
  tramos_cuotas: "tramos_cuotas",
} as const;

export function emisoraLineFieldName(
  index: number,
  field: "emisora" | "ciudad" | "channel_id",
): string {
  return `emisora_line_${index}_${field}`;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (value == null) return "";
  return String(value).trim();
}

function readNumber(formData: FormData, key: string): number {
  const raw = readString(formData, key);
  if (!raw) return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

/** Convierte dd/mm/aaaa o yyyy-mm-dd del formulario a ISO yyyy-mm-dd. */
function readTramosCuotas(formData: FormData): TramoCuota[] | null {
  const raw = readString(formData, ORDEN_FORM_NAMES.tramos_cuotas);
  if (!raw) return null;
  try {
    return parseTramosCuotas(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readDateField(formData: FormData, key: string): string {
  return normalizeDateInputValue(readString(formData, key));
}

export function parseOrdenFormData(formData: FormData): OrdenTransmisionForm {
  return {
    ...parseOrdenFormDataCompartido(formData),
    emisora: readString(formData, ORDEN_FORM_NAMES.emisora),
    ciudad: readString(formData, ORDEN_FORM_NAMES.ciudad) || undefined,
    channel_id: readString(formData, ORDEN_FORM_NAMES.channel_id) || undefined,
  };
}

export function parseOrdenFormDataCompartido(
  formData: FormData,
): OrdenTransmisionFormCompartido {
  const n = ORDEN_FORM_NAMES;
  const duracionRaw = readString(formData, n.duracion_seg);

  return {
    cliente: readString(formData, n.cliente),
    campaña: readString(formData, n.campana),
    estado: (readString(formData, n.estado) || "pausada") as EstadoOrden,
    agencia: readString(formData, n.agencia) || undefined,
    email_cliente: readString(formData, n.email_cliente),
    telefono_cliente: normalizeTelefonoCliente(
      readString(formData, n.telefono_cliente),
    ),
    cuñas_diarias: readNumber(formData, n.cunias_diarias),
    total_contratadas: readNumber(formData, n.total_contratadas),
    periodo_inicio: readDateField(formData, n.periodo_inicio),
    periodo_fin: readDateField(formData, n.periodo_fin),
    horario: readString(formData, n.horario) || undefined,
    spot_id: readString(formData, n.spot_id) || undefined,
    spot_name: readString(formData, n.spot_name) || undefined,
    duracion_seg: duracionRaw ? readNumber(formData, n.duracion_seg) : undefined,
    numero_certificado:
      readString(formData, n.numero_certificado) || undefined,
    tramos_cuotas: readTramosCuotas(formData),
  };
}

export function parseEmisoraLineas(formData: FormData): OrdenEmisoraLinea[] {
  const rawCount = readString(formData, ORDEN_FORM_NAMES.emisora_line_count);
  const count = Math.max(1, Number.parseInt(rawCount || "1", 10) || 1);
  const lineas: OrdenEmisoraLinea[] = [];

  for (let i = 0; i < count; i++) {
    lineas.push({
      emisora: readString(formData, emisoraLineFieldName(i, "emisora")),
      ciudad: readString(formData, emisoraLineFieldName(i, "ciudad")),
      channel_id:
        readString(formData, emisoraLineFieldName(i, "channel_id")) ||
        undefined,
    });
  }

  return lineas;
}

export function mergeOrdenForm(
  compartido: OrdenTransmisionFormCompartido,
  linea: OrdenEmisoraLinea,
): OrdenTransmisionForm {
  return {
    ...compartido,
    emisora: linea.emisora,
    ciudad: linea.ciudad || undefined,
    channel_id: linea.channel_id,
  };
}

export function validateOrdenForm(
  data: OrdenTransmisionForm,
  formData?: FormData,
): string | null {
  const compartidoError = validateOrdenFormCompartido(data, formData);
  if (compartidoError) return compartidoError;

  if (!data.emisora) return "Completa los campos obligatorios: Emisora.";
  if (!data.ciudad?.trim()) return "Completa los campos obligatorios: Ciudad.";

  const spotRuleError = validateEstadoSpotRule(data);
  if (spotRuleError) return spotRuleError;

  return null;
}

export function validateOrdenFormMulti(
  compartido: OrdenTransmisionFormCompartido,
  lineas: OrdenEmisoraLinea[],
  formData?: FormData,
): string | null {
  const compartidoError = validateOrdenFormCompartido(compartido, formData);
  if (compartidoError) return compartidoError;

  if (lineas.length === 0) {
    return "Añade al menos una emisora.";
  }

  const seen = new Set<string>();
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (!linea.emisora.trim()) {
      return `Emisora obligatoria en la fila ${i + 1}.`;
    }
    if (!linea.ciudad?.trim()) {
      return `Ciudad obligatoria en la fila ${i + 1}.`;
    }
    const key = `${linea.emisora.trim().toLowerCase()}|${linea.ciudad.trim().toLowerCase()}`;
    if (seen.has(key)) {
      return "No repitas la misma emisora y ciudad.";
    }
    seen.add(key);

    const merged = mergeOrdenForm(compartido, linea);
    const spotRuleError = validateEstadoSpotRule(merged);
    if (spotRuleError) return spotRuleError;
  }

  return null;
}

function validateOrdenFormCompartido(
  data: OrdenTransmisionFormCompartido,
  formData?: FormData,
): string | null {
  const missing: string[] = [];
  if (!data.cliente) missing.push("Cliente");
  if (!data.campaña) missing.push("Campaña");
  if (!data.email_cliente) missing.push("Correo del coordinador");
  if (!data.telefono_cliente) missing.push("Teléfono del coordinador");
  if (!data.periodo_inicio) missing.push("Periodo Inicio");
  if (!data.periodo_fin) missing.push("Periodo Fin");

  if (missing.length > 0) {
    if (formData) {
      const invalidDates: string[] = [];
      const n = ORDEN_FORM_NAMES;
      if (
        !data.periodo_inicio &&
        readString(formData, n.periodo_inicio)
      ) {
        invalidDates.push("Periodo Inicio");
      }
      if (!data.periodo_fin && readString(formData, n.periodo_fin)) {
        invalidDates.push("Periodo Fin");
      }
      if (invalidDates.length > 0) {
        return `Fecha inválida en: ${invalidDates.join(", ")}. Usa el formato dd/mm/aaaa.`;
      }
    }
    return `Completa los campos obligatorios: ${missing.join(", ")}.`;
  }

  if (!Number.isFinite(data.cuñas_diarias) || data.cuñas_diarias < 1) {
    return "Cuñas diarias debe ser al menos 1.";
  }

  if (!Number.isFinite(data.total_contratadas) || data.total_contratadas < 1) {
    return "Total contratadas debe ser al menos 1.";
  }

  if (data.periodo_fin < data.periodo_inicio) {
    return "La fecha fin no puede ser anterior al inicio.";
  }

  const tramos = resolveTramosCuotas(data);
  if (tramos.length === 0) {
    return "Configura al menos un tramo de cuota válido.";
  }

  const periodoError = validarTramosDentroPeriodo(
    data.periodo_inicio,
    data.periodo_fin,
    tramos,
  );
  if (periodoError) return periodoError;

  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i];
    if (!t.dias_semana.length) {
      return `Tramo ${i + 1}: selecciona al menos un día de la semana.`;
    }
    if (!Number.isFinite(t.cuñas_por_dia) || t.cuñas_por_dia < 0) {
      return `Tramo ${i + 1}: cuñas por día inválidas.`;
    }
  }

  const huecosError = validarHuecosCoberturaTramos(
    data.periodo_inicio,
    data.periodo_fin,
    tramos,
  );
  if (huecosError) return huecosError;

  const telefonoError = validateTelefonoCliente(data.telefono_cliente);
  if (telefonoError) return telefonoError;

  const emailError = validateEmail(data.email_cliente);
  if (emailError) return emailError;

  return null;
}

export { applyEstadoSpotRules };

export function ordenFormToPayload(data: OrdenTransmisionForm) {
  const tramos = resolveTramosCuotas(data);
  return {
    cliente: data.cliente.trim(),
    campaña: data.campaña.trim(),
    emisora: data.emisora.trim(),
    ciudad: data.ciudad?.trim() || null,
    estado: data.estado,
    agencia: data.agencia?.trim() || null,
    email_cliente: data.email_cliente.trim(),
    telefono_cliente: data.telefono_cliente,
    channel_id: data.channel_id?.trim() || null,
    cuñas_diarias: data.cuñas_diarias,
    total_contratadas: data.total_contratadas,
    periodo_inicio: data.periodo_inicio,
    periodo_fin: data.periodo_fin,
    horario: data.horario?.trim() || null,
    spot_id: data.spot_id?.trim() || null,
    spot_name: data.spot_name?.trim() || null,
    duracion_seg: data.duracion_seg ?? null,
    numero_certificado: data.numero_certificado?.trim() || null,
    tramos_cuotas: tramos.length > 0 ? tramos : null,
  };
}
