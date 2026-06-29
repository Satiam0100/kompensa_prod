interface RowSelectCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function RowSelectCheckbox({
  checked,
  onChange,
  label,
}: RowSelectCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="w-4 h-4 shrink-0 rounded border-outline-variant text-tertiary focus:ring-tertiary cursor-pointer"
    />
  );
}
