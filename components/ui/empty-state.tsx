export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium text-foreground-muted">{title}</p>
      <p className="mt-1 text-xs text-foreground-subtle">{message}</p>
    </div>
  );
}
