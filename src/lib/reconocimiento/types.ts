/** Detección cruda de la API monitoreodigital. */
export interface DeteccionApi {
  channel_id: string;
  channel_name: string;
  city: string;
  datetime_utc: string;
  duration_seg: number;
  spot_id: string;
  spot_name: string;
}

/** Grupo agregado: emisora + spot_id + ciudad. */
export interface ReconocimientoGrupo {
  key: string;
  channel_id: string;
  channel_name: string;
  city: string;
  spot_id: string;
  spot_name: string;
  count: number;
  duration_seg: number | null;
  primera_deteccion: string;
  ultima_deteccion: string;
  detecciones: DeteccionApi[];
}

export const RECONOCIMIENTO_MAX_DIAS = 31;
