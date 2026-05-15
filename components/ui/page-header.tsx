export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-foreground-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
    </div>
  );
}
