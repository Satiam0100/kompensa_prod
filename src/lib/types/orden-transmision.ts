export type EstadoOrden = "activa" | "pausada" | "finalizada";

export interface OrdenTransmisionForm {
  cliente: string;
  campaña: string;
  emisora: string;
  ciudad?: string;
  estado: EstadoOrden;
  agencia?: string;
  email_cliente: string;
  cuñas_diarias: number;
  total_contratadas: number;
  periodo_inicio: string;
  periodo_fin: string;
  horario?: string;
  spot_id?: string;
  spot_name?: string;
  duracion_seg?: number;
}

export interface OrdenTransmisionRow extends OrdenTransmisionForm {
  id: string;
  created_at: string;
  updated_at: string;
}
