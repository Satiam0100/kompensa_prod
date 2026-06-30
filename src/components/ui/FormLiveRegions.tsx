const SR_ONLY =
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]";

interface FormLiveRegionsProps {
  error?: string | null;
  success?: string | null;
  className?: string;
  errorClassName?: string;
  successClassName?: string;
}

export function FormLiveRegions({
  error = null,
  success = null,
  className = "",
  errorClassName = "text-error text-body-sm px-2",
  successClassName = SR_ONLY,
}: FormLiveRegionsProps) {
  return (
    <div className={className} aria-relevant="additions text">
      <p
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={error ? errorClassName : SR_ONLY}
      >
        {error ?? ""}
      </p>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={success ? successClassName : SR_ONLY}
      >
        {success ?? ""}
      </p>
    </div>
  );
}
