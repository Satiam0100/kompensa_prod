/** Cabeceras de seguridad compartidas (next.config + vercel.json + middleware). */

export const xRobotsTag = "noindex, nofollow, noarchive";

export type ContentSecurityPolicyOptions = {
  /** Nonce por petición (middleware). Sin nonce → fallback legacy con unsafe-inline. */
  nonce?: string;
  allowUnsafeEval?: boolean;
  /** Dev: Emotion/MUI sin nonce en estilos. Prod: usar nonce. */
  styleUnsafeInline?: boolean;
};

export function buildContentSecurityPolicy(
  options: ContentSecurityPolicyOptions = {},
): string {
  const {
    nonce,
    allowUnsafeEval = false,
    styleUnsafeInline = false,
  } = options;

  const scriptParts = ["'self'"];
  if (nonce) {
    scriptParts.push(`'nonce-${nonce}'`, "'strict-dynamic'");
  } else {
    scriptParts.push("'unsafe-inline'");
  }
  if (allowUnsafeEval) {
    scriptParts.push("'unsafe-eval'");
  }

  const styleParts = ["'self'"];
  if (styleUnsafeInline) {
    styleParts.push("'unsafe-inline'");
  } else if (nonce) {
    styleParts.push(`'nonce-${nonce}'`);
  } else {
    styleParts.push("'unsafe-inline'");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptParts.join(" ")}`,
    `style-src ${styleParts.join(" ")}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/** CSP legacy estática (solo si no hay middleware/proxy con nonce). */
export const contentSecurityPolicy = buildContentSecurityPolicy({
  allowUnsafeEval: false,
});

export const developmentContentSecurityPolicy = buildContentSecurityPolicy({
  allowUnsafeEval: true,
  styleUnsafeInline: true,
});

export const permissionsPolicy =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

export type SecurityHeader = { key: string; value: string };

/** Cabeceras estáticas (sin CSP; la CSP dinámica la aplica middleware). */
export const staticSecurityHeaders: SecurityHeader[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: permissionsPolicy },
  { key: "X-Robots-Tag", value: xRobotsTag },
];

/** @deprecated Usar staticSecurityHeaders; CSP va en middleware. */
export const appSecurityHeaders: SecurityHeader[] = [
  ...staticSecurityHeaders,
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

/** Localhost / pnpm dev — CSP legacy si middleware no corre. */
export const developmentSecurityHeaders: SecurityHeader[] = [
  ...staticSecurityHeaders,
  {
    key: "Content-Security-Policy",
    value: developmentContentSecurityPolicy,
  },
];

/** Producción en edge (Vercel): incluye HSTS. Sin CSP (middleware). */
export const productionSecurityHeaders: SecurityHeader[] = [
  ...staticSecurityHeaders,
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

export function createRequestNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function buildNonceContentSecurityPolicy(isDev: boolean, nonce: string) {
  return buildContentSecurityPolicy({
    nonce,
    allowUnsafeEval: isDev,
    styleUnsafeInline: isDev,
  });
}
