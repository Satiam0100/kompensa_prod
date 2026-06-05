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
