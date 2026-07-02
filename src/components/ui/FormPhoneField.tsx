"use client";

import { useCallback, type ChangeEvent } from "react";
import { FormField, type FormFieldProps } from "@/components/ui/FormField";
import { sanitizePhoneInput } from "@/lib/validate-phone";

type FormPhoneFieldProps = Omit<FormFieldProps, "type" | "inputMode" | "onChange">;

export function FormPhoneField(props: FormPhoneFieldProps) {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhoneInput(e.target.value);
    if (sanitized !== e.target.value) {
      e.target.value = sanitized;
    }
  }, []);

  return (
    <FormField
      {...props}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      pattern="[0-9]*"
      onChange={handleChange}
    />
  );
}
