import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { getAuthSecretBytes } from "@/lib/auth/config";
import { SESSION_COOKIE } from "@/lib/auth/constants";

async function isValidSession(token: string) {
  try {
    await jwtVerify(token, getAuthSecretBytes());
    return true;
  } catch {
    return false;
  }
}

const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = token ? await isValidSession(token) : false;

  if (isPublic) {
    if (authenticated && pathname === "/login") {
      return NextResponse.redirect(new URL("/ordenes/nueva", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
