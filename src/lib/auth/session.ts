import { createHash, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "./constants";
import { getAuthCredentials, getAuthSecretBytes } from "./config";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyCredentials(user: string, password: string): boolean {
  const expected = getAuthCredentials();
  const userHash = hashValue(user.trim());
  const expectedUserHash = hashValue(expected.user);
  const passHash = hashValue(password);
  const expectedPassHash = hashValue(expected.password);

  try {
    return (
      timingSafeEqual(userHash, expectedUserHash) &&
      timingSafeEqual(passHash, expectedPassHash)
    );
  } catch {
    return false;
  }
}

export async function createSessionToken(username: string) {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getAuthSecretBytes());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretBytes());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(username: string) {
  const token = await createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
