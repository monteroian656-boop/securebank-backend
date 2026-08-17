export function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="card flex items-center gap-3 text-sm text-muted">
      <span className="h-4 w-4 rounded-full border-2 border-border border-t-accent animate-spin" />
      {label}
    </div>
  );
}
