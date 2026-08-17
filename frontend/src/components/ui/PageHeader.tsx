export function PageHeader({
  title,
  huRef,
  description,
}: {
  title: string;
  huRef: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="font-mono text-xs text-accent mb-1">{huRef}</p>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted mt-1 max-w-2xl">{description}</p>
    </div>
  );
}
