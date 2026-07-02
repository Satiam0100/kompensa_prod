import type { TramoCuota } from "@/lib/types/tramo-cuota";

export type EstadoOrden = "activa" | "pausada" | "finalizada";

export interface OrdenEmisoraLinea {
  emisora: string;
  ciudad: string;
  channel_id?: string;
}

export type OrdenTransmisionFormCompartido = Omit<
  OrdenTransmisionForm,
  "emisora" | "ciudad" | "channel_id"
>;

export interface OrdenTransmisionForm {
  cliente: string;
  campaña: string;
  emisora: string;
  ciudad?: string;
  estado: EstadoOrden;
  agencia?: string;
  email_cliente: string;
  telefono_cliente: string;
  channel_id?: string;
  cuñas_diarias: number;
  total_contratadas: number;
  periodo_inicio: string;
  periodo_fin: string;
  horario?: string;
  spot_id?: string;
  spot_name?: string;
  duracion_seg?: number;
  numero_certificado?: string;
  tramos_cuotas?: TramoCuota[] | null;
}

export interface OrdenTransmisionRow extends Omit<
  OrdenTransmisionForm,
  "telefono_cliente" | "channel_id" | "numero_certificado"
> {
  telefono_cliente: string | null;
  channel_id: string | null;
  numero_certificado: string | null;
  tramos_cuotas: TramoCuota[] | null;
  id: string;
  created_at: string;
  updated_at: string;
}
