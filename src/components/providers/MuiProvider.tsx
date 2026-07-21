"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { ReactNode } from "react";

interface MuiProviderProps {
  children: ReactNode;
  nonce?: string;
}

export function MuiProvider({ children, nonce }: MuiProviderProps) {
  return (
    <AppRouterCacheProvider
      options={nonce ? { nonce, key: "mui" } : { key: "mui" }}
    >
      {children}
    </AppRouterCacheProvider>
  );
}
