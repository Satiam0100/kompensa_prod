/** 1 = lunes … 7 = domingo (ISO) */
export type DiaSemanaIso = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TramoCuota {
  desde: string;
  hasta: string;
  dias_semana: DiaSemanaIso[];
  cuñas_por_dia: number;
}

export const DIAS_SEMANA_LV: DiaSemanaIso[] = [1, 2, 3, 4, 5];

export const DIAS_SEMANA_TODOS: DiaSemanaIso[] = [1, 2, 3, 4, 5, 6, 7];

export const DIAS_SEMANA_LABELS: Record<DiaSemanaIso, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};
