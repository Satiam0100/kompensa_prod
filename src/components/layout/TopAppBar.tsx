interface TopAppBarProps {
  title: string;
  subtitle?: string;
}

export function TopAppBar({ title, subtitle }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center w-full px-8 py-4 bg-surface-container-lowest shadow-sm border-b border-outline-variant">
      <div className="flex flex-col">
        <span className="text-headline-sm font-bold text-primary">{title}</span>
        {subtitle && (
          <span className="text-label-mono text-[10px] text-on-tertiary-container uppercase tracking-widest">
            {subtitle}
          </span>
        )}
      </div>
    </header>
  );
}
