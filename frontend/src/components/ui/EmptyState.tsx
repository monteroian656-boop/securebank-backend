export function EmptyState({
  title = 'No hay datos',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="card text-center py-10">
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="text-sm text-muted mt-1">{description}</p>}
    </div>
  );
}
