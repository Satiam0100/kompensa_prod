export type EstadoOrden = "activa" | "pausada" | "finalizada";

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
}

export interface OrdenTransmisionRow extends Omit<
  OrdenTransmisionForm,
  "telefono_cliente" | "channel_id"
> {
  telefono_cliente: string | null;
  channel_id: string | null;
  id: string;
  created_at: string;
  updated_at: string;
}
