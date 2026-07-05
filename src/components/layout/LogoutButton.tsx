"use client";

import { logout } from "@/app/actions/auth";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function LogoutButton() {
  return (
    <form action={logout} method="POST" className="pt-4 border-t border-outline-variant">
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors duration-150"
      >
        <MaterialIcon name="logout" />
        <span className="text-label-sm">Cerrar sesión</span>
      </button>
    </form>
  );
}
