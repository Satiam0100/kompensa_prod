const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "El correo electrónico es obligatorio.";
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Ingresa un correo electrónico válido.";
  }
  return null;
}

export function validateOptionalEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return null;
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Ingresa un correo electrónico válido.";
  }
  return null;
}
