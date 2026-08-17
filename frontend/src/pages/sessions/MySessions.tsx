import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { apiRequest } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { Session } from '@/types/shared';

// HU-16 Cerrar sesión manualmente en todos los dispositivos activos.
//Cada fila viene de la tabla `sessions` real, al cerrar una invalida, el middleware de auth la rechaza en la siguiente petición).
export function MySessions() {
  const { logout } = useAuth();
  const { data: sessions, loading, error, reload } = useAsyncData(() => apiRequest<Session[]>('/sessions'));
  const [confirmingAll, setConfirmingAll] = useState(false);

  const { run: closeOne, loading: closingOne } = useAsyncAction(async (id: string) => {
    await apiRequest(`/sessions/${id}`, { method: 'DELETE' });
    reload();
  }, 'Sesión cerrada');

  const { run: closeAll, loading: closingAll } = useAsyncAction(async () => {
    await apiRequest('/sessions/close-all', { method: 'POST' });
    setConfirmingAll(false);
    logout();
  }, 'Todas las sesiones fueron cerradas');

  return (
    <div>
      <PageHeader
        title="Mis sesiones activas"
        huRef="HU-16"
        description="Cerrá tus sesiones en todos los dispositivos si sospechás un acceso no autorizado."
      />

      {loading && <LoadingState label="Cargando sesiones..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && sessions && (
        <div className="card max-w-lg">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm">{s.userAgent ?? 'Dispositivo desconocido'}</p>
                <p className="text-xs text-muted font-mono">
                  Iniciada {new Date(s.createdAt).toLocaleString('es-CR')}
                </p>
              </div>
              <button
                className="text-risk-high text-xs font-medium"
                disabled={closingOne}
                onClick={() => closeOne(s.id)}
              >
                Cerrar
              </button>
            </div>
          ))}
          <button className="btn-primary mt-4 w-full" onClick={() => setConfirmingAll(true)}>
            Cerrar todas las sesiones
          </button>
        </div>
      )}

      {confirmingAll && (
        <Modal
          title="¿Cerrar todas las sesiones?"
          description="Vas a cerrar tu propia sesión también y deberás iniciar sesión de nuevo."
          onClose={() => setConfirmingAll(false)}
        >
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setConfirmingAll(false)}>
              Cancelar
            </button>
            <button
              className="bg-risk-high text-white px-4 py-2 rounded text-sm font-medium"
              disabled={closingAll}
              onClick={() => closeAll()}
            >
              {closingAll ? 'Cerrando...' : 'Sí, cerrar todas'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
