"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  setSessionCookie,
  verifyCredentials,
} from "@/lib/auth/session";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function login(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const user = (formData.get("user") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  if (!user || !password) {
    return { success: false, error: "Usuario y contraseña son obligatorios." };
  }

  if (!verifyCredentials(user, password)) {
    return { success: false, error: "Credenciales incorrectas." };
  }

  await setSessionCookie(user);
  redirect("/ordenes/nueva");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
