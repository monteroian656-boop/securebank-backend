import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useAsyncData } from '@/hooks/useAsyncData';
import { apiRequest } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { SilentValidationError } from '@/utils/errors';
import type { SecurityPolicy } from '@/types/shared';

// HU-11 Desactivación automática de cuentas inactivas.
export function InactivityPolicy() {
  const { tenant } = useAuth();
  const { data: current, loading: loadingCurrent, reload: reloadPolicy } = useAsyncData(
    () => apiRequest<SecurityPolicy>(`/security-policy/${tenant?.id}`),
    [tenant?.id],
  );
  const { data: preview, reload: reloadPreview } = useAsyncData(
    () => apiRequest<{ count: number }>('/users/inactive-count'),
    [current?.inactivityDays],
  );

  const [days, setDays] = useState(60);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (current) setDays(current.inactivityDays);
  }, [current]);

  const { run: submit, loading } = useAsyncAction(async () => {
    if (days <= 0) {
      setError('Debe ser un número positivo de días');
      throw new SilentValidationError();
    }
    setError(null);
    await apiRequest(`/security-policy/${tenant?.id}`, {
      method: 'PUT',
      body: JSON.stringify({ inactivityDays: days }),
    });
    reloadPolicy();
    reloadPreview();
  }, 'Política de inactividad guardada');

  return (
    <div>
      <PageHeader
        title="Cuentas inactivas"
        huRef="HU-11"
        description="Periodo de inactividad tras el cual una cuenta se desactiva automáticamente."
      />
      {loadingCurrent && <LoadingState label="Cargando..." />}
      {!loadingCurrent && (
        <div className="card max-w-md space-y-4">
          <div>
            <label htmlFor="inactivity-days" className="text-xs text-muted">Días de inactividad permitidos</label>
            <input
              id="inactivity-days"
              className="input mt-1"
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
            {error && <p className="text-xs text-risk-high mt-1">{error}</p>}
          </div>
          <p className="text-xs text-muted">
            Con el valor guardado actualmente, <span className="font-mono text-text">{preview?.count ?? 0}</span> cuenta(s)
            se desactivarían hoy.
          </p>
          <button className="btn-primary" onClick={() => submit()} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  );
}
