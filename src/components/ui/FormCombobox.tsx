"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { FORM_FIELD_CONTROL_PLAIN } from "./form-field-classes";
import {
  computeFloatingMenuPosition,
  FLOATING_MENU_CLASS,
  subscribeFloatingOverlayListeners,
} from "./floating-menu-position";
import { MaterialIcon } from "./MaterialIcon";
import { usePortalRoot } from "./portal-root-context";
import type { SelectOption } from "./FormSelect";

interface FormComboboxProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
}

const MENU_GAP = 0;
const MENU_ITEM_HEIGHT = 40;
const MENU_PADDING = 8;
const MAX_VISIBLE_ITEMS = 8;

function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function FormCombobox({
  label,
  name,
  value,
  onChange,
  options,
  id,
  required,
  disabled = false,
  placeholder = "Buscar…",
  className = "",
  emptyMessage = "Sin coincidencias",
}: FormComboboxProps) {
  const portalRoot = usePortalRoot();
  const fieldId = id ?? `${name}-field`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [menuPlacement, setMenuPlacement] = useState<"above" | "below">(
    "below",
  );

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label ?? value;
  const isRequired = Boolean(required && !disabled);

  const filteredOptions = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return options;
    return options.filter((option) =>
      normalizeForSearch(option.label).includes(q),
    );
  }, [options, query]);

  const menuHeight =
    Math.min(filteredOptions.length, MAX_VISIBLE_ITEMS) * MENU_ITEM_HEIGHT +
    MENU_PADDING * 2 +
    (filteredOptions.length === 0 ? MENU_ITEM_HEIGHT : 0);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const { placement, style } = computeFloatingMenuPosition(
      triggerRef.current,
      portalRoot,
      menuHeight,
      MENU_GAP,
    );

    setMenuPlacement(placement);
    setMenuStyle(style);
  }, [menuHeight, portalRoot]);

  const commitValue = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      if (hiddenRef.current) hiddenRef.current.value = nextValue;
    },
    [onChange],
  );

  useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.value = value;
  }, [value]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    return subscribeFloatingOverlayListeners({
      onReposition: updateMenuPosition,
      onClose: closeMenu,
      menuSelector: "[data-form-combobox-menu]",
    });
  }, [open, updateMenuPosition, closeMenu, filteredOptions.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-form-combobox-menu]")) return;
      setOpen(false);
      setQuery("");
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setQuery(displayValue);
    updateMenuPosition();
  };

  const handleSelect = (nextValue: string) => {
    commitValue(nextValue);
    setOpen(false);
    setQuery("");
  };

  const handleInputChange = (nextQuery: string) => {
    setQuery(nextQuery);
    if (!open) setOpen(true);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false);
        setQuery("");
      }
    }, 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && filteredOptions.length > 0) {
      event.preventDefault();
      handleSelect(filteredOptions[0].value);
    }
    if (event.key === "Enter" && filteredOptions.length === 1) {
      event.preventDefault();
      handleSelect(filteredOptions[0].value);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      <label
        id={labelId}
        htmlFor={fieldId}
        className="text-label-sm text-on-surface-variant px-1"
      >
        {label}
        {isRequired && (
          <span className="text-tertiary" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div
        ref={triggerRef}
        className={`${FORM_FIELD_CONTROL_PLAIN} form-select-field ${open ? `form-field-control--open form-select-field--open form-select-field--open-${menuPlacement} !border-tertiary !shadow-[0_0_0_1px_var(--color-tertiary)]` : ""} ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={hiddenRef}
          type="hidden"
          name={name}
          value={value}
          required={isRequired}
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="flex w-full items-center gap-2">
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            role="combobox"
            aria-labelledby={labelId}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-required={isRequired || undefined}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            placeholder={placeholder}
            value={open ? query : displayValue}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={openMenu}
            onClick={openMenu}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="form-combobox-input flex-1 min-w-0 bg-transparent border-none outline-none py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60"
            autoComplete="off"
          />
          <MaterialIcon
            name="search"
            className="shrink-0 text-outline-variant text-sm pointer-events-none"
          />
        </div>
        {open &&
          !disabled &&
          createPortal(
            <ul
              id={listboxId}
              data-form-combobox-menu
              role="listbox"
              aria-label={label}
              style={menuStyle}
              className={`${FLOATING_MENU_CLASS} form-select-menu--${menuPlacement}`}
            >
              {filteredOptions.length === 0 ? (
                <li role="presentation">
                  <span className="form-select-option text-on-surface-variant cursor-default">
                    {emptyMessage}
                  </span>
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(event) => event.preventDefault()}
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
                })
              )}
            </ul>,
            portalRoot,
          )}
      </div>
    </div>
  );
}
