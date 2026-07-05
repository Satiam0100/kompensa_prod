import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthSecretBytes } from "@/lib/auth/config";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import {
  applySecurityHeaders,
  createSecureRequestContext,
} from "@/lib/security/apply-response-security";

async function isValidSession(token: string) {
  try {
    await jwtVerify(token, getAuthSecretBytes());
    return true;
  } catch {
    return false;
  }
}

const publicPaths = ["/login", "/privacidad"];

export async function middleware(request: NextRequest) {
  const { csp, requestHeaders } = createSecureRequestContext(request);
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = token ? await isValidSession(token) : false;

  if (isPublic) {
    if (authenticated && pathname === "/login") {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/ordenes/nueva", request.url)),
        csp,
      );
    }
    return applySecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      csp,
    );
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), csp);
  }

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    csp,
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|site.webmanifest|theme-init\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt)$).*)",
  ],
};
