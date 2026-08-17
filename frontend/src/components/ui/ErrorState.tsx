export function ErrorState({
  message = 'Ocurrió un error al cargar la información.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card border-risk-high/30 bg-risk-high/5">
      <p className="text-sm text-risk-high font-medium mb-1">No se pudo completar la acción</p>
      <p className="text-sm text-text/80 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary !py-1.5 !px-3">
          Reintentar
        </button>
      )}
    </div>
  );
}
