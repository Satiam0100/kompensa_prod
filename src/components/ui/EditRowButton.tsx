import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const buttonClass =
  "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary text-label-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shrink-0";

interface EditRowButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export function EditRowButton({
  href,
  onClick,
  label = "Editar",
}: EditRowButtonProps) {
  const content = (
    <>
      <MaterialIcon name="edit" className="text-[16px]" />
      Editar
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={buttonClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={buttonClass}>
      {content}
    </button>
  );
}
