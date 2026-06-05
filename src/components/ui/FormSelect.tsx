"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { FORM_FIELD_CONTROL_PLAIN } from "./form-field-classes";
import { MaterialIcon } from "./MaterialIcon";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  options: SelectOption[];
  className?: string;
}

const MENU_GAP = 0;
const MENU_ITEM_HEIGHT = 40;
const MENU_PADDING = 8;

export function FormSelect({
  label,
  name,
  defaultValue = "",
  required,
  options,
  className = "",
}: FormSelectProps) {
  const generatedId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(
    () => defaultValue || options[0]?.value || "",
  );
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [menuPlacement, setMenuPlacement] = useState<"above" | "below">(
    "below",
  );

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const menuHeight = options.length * MENU_ITEM_HEIGHT + MENU_PADDING * 2;

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const width = rect.width;
    const left = rect.left;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openBelow =
      spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

    let top = openBelow
      ? rect.bottom + MENU_GAP
      : rect.top - menuHeight - MENU_GAP;

    if (!openBelow) {
      top = Math.max(8, top);
    }

    setMenuPlacement(openBelow ? "below" : "above");
    setMenuStyle({ top, left, width });
  }, [menuHeight]);

  const commitValue = useCallback((nextValue: string) => {
    setValue(nextValue);
    if (hiddenRef.current) hiddenRef.current.value = nextValue;
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-form-select-menu]")) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleReset = () => {
      const resetValue = defaultValue || options[0]?.value || "";
      commitValue(resetValue);
    };

    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [commitValue, defaultValue, options]);

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current;
      if (next) updateMenuPosition();
      return next;
    });
  };

  const handleSelect = (nextValue: string) => {
    commitValue(nextValue);
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      <label
        htmlFor={generatedId}
        className="text-label-sm text-on-surface-variant px-1"
      >
        {label}
        {required && <span className="text-tertiary"> *</span>}
      </label>
      <div
        ref={triggerRef}
        className={`${FORM_FIELD_CONTROL_PLAIN} form-select-field ${open ? `form-field-control--open form-select-field--open form-select-field--open-${menuPlacement} !border-tertiary !shadow-[0_0_0_1px_var(--color-tertiary)]` : ""}`}
      >
        <input
          ref={hiddenRef}
          type="hidden"
          id={generatedId}
          name={name}
          value={value}
          required={required}
        />
        <button
          type="button"
          className="form-select-trigger"
          onClick={toggleOpen}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate text-left">
            {selectedOption?.label ?? "Seleccionar"}
          </span>
          <MaterialIcon
            name="expand_more"
            className={`shrink-0 text-outline-variant transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open &&
          createPortal(
            <ul
              data-form-select-menu
              role="listbox"
              aria-label={label}
              style={menuStyle}
              className={`form-select-menu form-select-menu--${menuPlacement} fixed z-50`}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value)}
                      className={[
                        "form-select-option",
                        isSelected
                          ? "bg-tertiary text-on-tertiary"
                          : "text-on-surface hover:bg-surface-container-high",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )}
      </div>
    </div>
  );
}
