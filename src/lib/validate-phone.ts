export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateOptionalPhone(phone: string): string | null {
  const digits = sanitizePhoneInput(phone);
  if (!digits) return null;
  if (digits.length < 7) {
    return "El teléfono debe tener al menos 7 dígitos.";
  }
  return null;
}
