"use client";

import { useCallback, useId, useState, type KeyboardEvent } from "react";
import {
  FORM_FIELD_CONTROL,
  FORM_FIELD_INPUT,
} from "@/components/ui/form-field-classes";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface FormTagInputProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function joinTags(tags: string[]): string {
  return tags.join(", ");
}

export function FormTagInput({
  label,
  name,
  defaultValue = "",
  placeholder,
  required,
}: FormTagInputProps) {
  const generatedId = useId();
  const fieldId = `${name}-${generatedId}`;
  const [tags, setTags] = useState(() => parseTags(defaultValue));
  const [input, setInput] = useState("");

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      setTags((current) => {
        if (current.some((item) => item.toLowerCase() === tag.toLowerCase())) {
          return current;
        }
        return [...current, tag];
      });
      setInput("");
    },
    [],
  );

  const removeTag = useCallback((index: number) => {
    setTags((current) => current.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(input);
        return;
      }

      if (e.key === "Backspace" && !input && tags.length > 0) {
        setTags((current) => current.slice(0, -1));
      }
    },
    [addTag, input, tags.length],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      if (!value.includes(",")) {
        setInput(value);
        return;
      }

      const parts = value.split(",");
      parts.slice(0, -1).forEach((part) => addTag(part));
      setInput(parts[parts.length - 1] ?? "");
    },
    [addTag],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-label-sm text-on-surface-variant px-1"
      >
        {label}
        {required && (
          <span className="text-tertiary" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div className={`${FORM_FIELD_CONTROL} flex-wrap py-2`}>
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-surface-container-high border border-outline-variant px-2 py-0.5 text-label-sm text-on-surface"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="inline-flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface"
              aria-label={`Quitar ${tag}`}
            >
              <MaterialIcon name="close" className="text-[14px]" />
            </button>
          </span>
        ))}
        <input
          id={fieldId}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={`${FORM_FIELD_INPUT} min-w-[8rem] flex-1 py-1`}
        />
      </div>
      <input type="hidden" name={name} value={joinTags(tags)} />
      <p className="text-label-sm text-on-surface-variant px-1">
        Presiona Enter o escribe una coma para añadir cada cliente.
      </p>
    </div>
  );
}
