"use client";

import { useActionState } from "react";
import { login, type LoginResult } from "@/app/actions/auth";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const initialState: LoginResult | null = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="user"
          className="text-label-sm text-on-surface-variant px-1"
        >
          Usuario
        </label>
        <input
          id="user"
          name="user"
          type="text"
          autoComplete="username"
          required
          placeholder="admin"
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface form-input-focus transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-label-sm text-on-surface-variant px-1"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface form-input-focus transition-all"
        />
      </div>

      {state && !state.success && (
        <p className="text-body-sm text-error px-1" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-tertiary text-on-tertiary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {pending ? (
          <>
            <MaterialIcon name="sync" className="animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <MaterialIcon name="login" filled />
            Iniciar sesión
          </>
        )}
      </button>
    </form>
  );
}
