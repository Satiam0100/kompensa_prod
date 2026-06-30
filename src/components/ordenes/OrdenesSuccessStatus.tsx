"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FormStatusMessage } from "@/components/ui/FormStatusMessage";

export function OrdenesSuccessStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createdRaw = searchParams.get("created");
  const count = createdRaw ? Number.parseInt(createdRaw, 10) : 0;

  useEffect(() => {
    if (!count || count < 1) return;
    const timer = window.setTimeout(() => {
      router.replace("/ordenes", { scroll: false });
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [count, router]);

  if (!count || count < 1) return null;

  const message =
    count === 1
      ? "1 orden guardada correctamente."
      : `${count} órdenes guardadas correctamente.`;

  return (
    <FormStatusMessage
      message={message}
      variant="status"
      className="mb-6 text-body-sm text-on-tertiary-container bg-tertiary-container/30 border border-tertiary/40 rounded-lg px-4 py-3"
    />
  );
}
