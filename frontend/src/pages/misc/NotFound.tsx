import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="card max-w-sm text-center">
        <p className="font-mono text-xs text-accent mb-1">404</p>
        <p className="text-sm font-medium mb-1">Página no encontrada</p>
        <p className="text-sm text-muted mb-4">La ruta que se está buscando no existe o fue eliminada.</p>
        <Link to="/" className="btn-primary inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
