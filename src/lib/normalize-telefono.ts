/** Normaliza teléfono a E.164 sin '+' (ej. 5841412345678) para WhatsApp. */
export function normalizeTelefonoCliente(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Móvil VE local: 04141234567 → 5841412345678
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `58${digits.slice(1)}`;
  }

  // Sin código país (10 dígitos) → prefijo 58
  if (!digits.startsWith("58") && digits.length === 10) {
    digits = `58${digits}`;
  }

  return digits;
}

export function validateTelefonoCliente(normalized: string): string | null {
  if (!normalized) {
    return "Teléfono Cliente es obligatorio.";
  }

  if (!/^58\d{10}$/.test(normalized)) {
    return "Teléfono inválido. Usa formato internacional (5841412345678) o local (04141234567).";
  }

  return null;
}
