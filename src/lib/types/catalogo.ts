export interface AgenciaRow {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  clientes: string | null;
  activa: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmisoraRow {
  id: string;
  nombre: string;
  ciudad: string | null;
  channel_id: string | null;
  contacto: string | null;
  email: string | null;
  whatsapp: string | null;
  circuito: string | null;
  tipo: string | null;
  activa: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgenciaForm {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  clientes?: string;
  activa: boolean;
  notas?: string;
}

export interface EmisoraForm {
  nombre: string;
  ciudad?: string;
  channel_id?: string;
  contacto?: string;
  email?: string;
  whatsapp?: string;
  circuito?: string;
  tipo?: string;
  activa: boolean;
  notas?: string;
}
