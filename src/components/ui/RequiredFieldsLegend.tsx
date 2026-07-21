export const REQUIRED_FIELDS_LEGEND_ID = "required-fields-legend";

interface RequiredFieldsLegendProps {
  className?: string;
}

export function RequiredFieldsLegend({ className = "" }: RequiredFieldsLegendProps) {
  return (
    <p
      id={REQUIRED_FIELDS_LEGEND_ID}
      role="note"
      className={`text-label-sm text-on-surface-variant ${className}`.trim()}
    >
      <span className="text-tertiary" aria-hidden="true">
        *
      </span>{" "}
      Campos obligatorios
    </p>
  );
}
