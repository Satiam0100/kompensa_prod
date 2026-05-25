/** Credenciales temporales cuando no hay variables de entorno (deploy sin AUTH_*). */
const DEFAULT_USER = "admin";
const DEFAULT_PASSWORD = "admin";
/** Solo para firmar sesiones sin AUTH_SECRET; reemplazar en producción. */
const DEFAULT_SECRET =
  "kompensa-temp-deploy-secret-reemplazar-en-produccion";

export function isAuthConfigured(): boolean {
  const secret = process.env.AUTH_SECRET;
  return Boolean(process.env.AUTH_PASSWORD && secret && secret.length >= 16);
}

export function getAuthCredentials() {
  return {
    user: process.env.AUTH_USER ?? DEFAULT_USER,
    password: process.env.AUTH_PASSWORD ?? DEFAULT_PASSWORD,
  };
}

export function getAuthSecretKey(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  return DEFAULT_SECRET;
}

export function getAuthSecretBytes() {
  return new TextEncoder().encode(getAuthSecretKey());
}
