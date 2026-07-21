import { type NextRequest, NextResponse } from "next/server";
import {
  buildNonceContentSecurityPolicy,
  createRequestNonce,
  xRobotsTag,
} from "../../../security-headers";

export function createSecureRequestContext(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const nonce = createRequestNonce();
  const csp = buildNonceContentSecurityPolicy(isDev, nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  return { nonce, csp, requestHeaders };
}

export function applySecurityHeaders(
  response: NextResponse,
  csp: string,
): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Robots-Tag", xRobotsTag);
  return response;
}
