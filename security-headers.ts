/** Cabeceras de seguridad compartidas (next.config + vercel.json). */

function buildContentSecurityPolicy(options: { allowUnsafeEval: boolean }): string {
  const scriptSrc = options.allowUnsafeEval
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
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

/** CSP producción (sin unsafe-eval; React no lo usa en prod). */
export const contentSecurityPolicy = buildContentSecurityPolicy({
  allowUnsafeEval: false,
});

/** CSP desarrollo (React/Turbopack requieren eval en dev). */
export const developmentContentSecurityPolicy = buildContentSecurityPolicy({
  allowUnsafeEval: true,
});

export const permissionsPolicy =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

export type SecurityHeader = { key: string; value: string };

function withCsp(csp: string): SecurityHeader[] {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: permissionsPolicy },
    { key: "Content-Security-Policy", value: csp },
  ];
}

/** Respuestas Next.js en producción (sin HSTS; Vercel lo añade en edge). */
export const appSecurityHeaders = withCsp(contentSecurityPolicy);

/** Localhost / pnpm dev — incluye unsafe-eval para React y Turbopack. */
export const developmentSecurityHeaders = withCsp(developmentContentSecurityPolicy);

/** Producción en edge (Vercel): incluye HSTS. */
export const productionSecurityHeaders: SecurityHeader[] = [
  ...appSecurityHeaders,
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];
