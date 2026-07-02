export const TELEFONO_CLIENTE_PLACEHOLDER = "0414 123 4567";

export const TELEFONO_CLIENTE_HINT =
  "Móvil venezolano. Acepta 0414…, 414… o +58 414…";

/** Normaliza teléfono a E.164 sin '+' (ej. 584141234567) para WhatsApp. */
export function normalizeTelefonoCliente(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Móvil VE local: 04141234567 → 584141234567
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `58${digits.slice(1)}`;
  }

  // Sin código país (10 dígitos) → prefijo 58
  if (!digits.startsWith("58") && digits.length === 10) {
    digits = `58${digits}`;
  }

  return digits;
}

/** Muestra un teléfono normalizado en formato local legible (0414 123 4567). */
export function formatTelefonoForDisplay(stored: string): string {
  let digits = stored.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("58") && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return stored;
}

export function validateTelefonoCliente(normalized: string): string | null {
  if (!normalized) {
    return "Teléfono Cliente es obligatorio.";
  }

  if (!/^58\d{10}$/.test(normalized)) {
    return `Teléfono inválido. ${TELEFONO_CLIENTE_HINT}`;
  }

  return null;
}
