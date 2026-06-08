import type {
  EstadoOrden,
  OrdenTransmisionForm,
} from "@/lib/types/orden-transmision";

/** Nombres ASCII en el HTML (evita problemas con ñ en FormData en algunos navegadores). */
export const ORDEN_FORM_NAMES = {
  cliente: "cliente",
  campana: "campana",
  emisora: "emisora",
  ciudad: "ciudad",
  estado: "estado",
  agencia: "agencia",
  email_cliente: "email_cliente",
  cunias_diarias: "cunias_diarias",
  total_contratadas: "total_contratadas",
  periodo_inicio: "periodo_inicio",
  periodo_fin: "periodo_fin",
  horario: "horario",
  spot_id: "spot_id",
  spot_name: "spot_name",
  duracion_seg: "duracion_seg",
} as const;

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

export function parseOrdenFormData(formData: FormData): OrdenTransmisionForm {
  const n = ORDEN_FORM_NAMES;
  const duracionRaw = readString(formData, n.duracion_seg);

  return {
    cliente: readString(formData, n.cliente),
    campaña: readString(formData, n.campana),
    emisora: readString(formData, n.emisora),
    ciudad: readString(formData, n.ciudad) || undefined,
    estado: (readString(formData, n.estado) || "activa") as EstadoOrden,
    agencia: readString(formData, n.agencia) || undefined,
    email_cliente: readString(formData, n.email_cliente),
    cuñas_diarias: readNumber(formData, n.cunias_diarias),
    total_contratadas: readNumber(formData, n.total_contratadas),
    periodo_inicio: readString(formData, n.periodo_inicio),
    periodo_fin: readString(formData, n.periodo_fin),
    horario: readString(formData, n.horario) || undefined,
    spot_id: readString(formData, n.spot_id) || undefined,
    spot_name: readString(formData, n.spot_name) || undefined,
    duracion_seg: duracionRaw ? readNumber(formData, n.duracion_seg) : undefined,
  };
}

export function validateOrdenForm(data: OrdenTransmisionForm): string | null {
  const missing: string[] = [];
  if (!data.cliente) missing.push("Cliente");
  if (!data.campaña) missing.push("Campaña");
  if (!data.emisora) missing.push("Emisora");
  if (!data.email_cliente) missing.push("Email Cliente");
  if (!data.periodo_inicio) missing.push("Periodo Inicio");
  if (!data.periodo_fin) missing.push("Periodo Fin");

  if (missing.length > 0) {
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

  return null;
}

export function ordenFormToPayload(data: OrdenTransmisionForm) {
  return {
    cliente: data.cliente.trim(),
    campaña: data.campaña.trim(),
    emisora: data.emisora.trim(),
    ciudad: data.ciudad?.trim() || null,
    estado: data.estado,
    agencia: data.agencia?.trim() || null,
    email_cliente: data.email_cliente.trim(),
    cuñas_diarias: data.cuñas_diarias,
    total_contratadas: data.total_contratadas,
    periodo_inicio: data.periodo_inicio,
    periodo_fin: data.periodo_fin,
    horario: data.horario?.trim() || null,
    spot_id: data.spot_id?.trim() || null,
    spot_name: data.spot_name?.trim() || null,
    duracion_seg: data.duracion_seg ?? null,
  };
}
