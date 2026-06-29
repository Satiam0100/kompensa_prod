const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"] as const;

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

const MONTHS_FULL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromISODate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function isoToDisplayInput(value: string): string {
  const date = fromISODate(value);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

/** Formatea dígitos sueltos como dd/mm/aaaa mientras se escribe. */
export function formatDateMaskFromDigits(digits: string): string {
  const normalized = digits.replace(/\D/g, "").slice(0, 8);
  if (normalized.length <= 2) return normalized;
  if (normalized.length <= 4) {
    return `${normalized.slice(0, 2)}/${normalized.slice(2)}`;
  }
  return `${normalized.slice(0, 2)}/${normalized.slice(2, 4)}/${normalized.slice(4)}`;
}

/** Parsea una fecha enmascarada dd/mm/aaaa. */
export function parseMaskedDate(value: string): string | null | "" {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  return buildISO(Number(match[3]), Number(match[2]), Number(match[1]));
}

function buildISO(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return toISODate(date);
}

/** Parsea texto escrito en formato dd/mm/aaaa. */
export function parseTypedDate(value: string): string | null | "" {
  return parseMaskedDate(value);
}

export function isISOInRange(
  iso: string,
  min?: string,
  max?: string,
): boolean {
  if (min && iso < min) return false;
  if (max && iso > max) return false;
  return true;
}

export function getMonthYearParts(date: Date): {
  month: string;
  monthLabel: string;
  year: number;
} {
  const index = date.getMonth();
  return {
    month: MONTHS_SHORT[index],
    monthLabel: MONTHS_FULL[index],
    year: date.getFullYear(),
  };
}

export function getYearBounds(min?: string, max?: string): {
  minYear: number;
  maxYear: number;
} {
  const currentYear = new Date().getFullYear();
  const minYear = min ? Number(min.slice(0, 4)) : currentYear - 100;
  const maxYear = max ? Number(max.slice(0, 4)) : currentYear + 100;
  return { minYear, maxYear };
}

export function getYearPageYears(
  centerYear: number,
  min?: string,
  max?: string,
): number[] {
  const { minYear, maxYear } = getYearBounds(min, max);
  const start = Math.max(minYear, centerYear - 5);
  const end = Math.min(maxYear, start + 11);
  const adjustedStart = Math.max(minYear, end - 11);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

export function getYearPageLabel(years: number[]): string {
  if (years.length === 0) return "";
  return `${years[0]} – ${years[years.length - 1]}`;
}

export function getCalendarDays(
  viewDate: Date,
): Array<{ date: Date | null; key: string }> {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startOffset = firstDay.getDay();
  startOffset = startOffset === 0 ? 6 : startOffset - 1;

  const cells: Array<{ date: Date | null; key: string }> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: null, key: `empty-start-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      key: `${year}-${month + 1}-${day}`,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, key: `empty-end-${cells.length}` });
  }

  return cells;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isDateDisabled(
  date: Date,
  min?: string,
  max?: string,
): boolean {
  const iso = toISODate(date);
  if (min && iso < min) return true;
  if (max && iso > max) return true;
  return false;
}

export { WEEKDAYS };
