import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

// Captura cualquier error de renderizado para evitar pantallas en blanco
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error no controlado en la UI:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
          <div className="card max-w-sm text-center">
            <p className="text-sm font-medium text-risk-high mb-1">Algo salió mal</p>
            <p className="text-sm text-muted mb-4">
              Ocurrió un error inesperado en la aplicación. Recargá la página para continuar.
            </p>
            <button className="btn-primary w-full" onClick={() => window.location.reload()}>
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
