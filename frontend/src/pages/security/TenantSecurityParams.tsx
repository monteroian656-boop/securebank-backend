import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useAsyncData } from '@/hooks/useAsyncData';
import { apiRequest } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { SilentValidationError } from '@/utils/errors';
import type { SecurityPolicy } from '@/types/shared';

// HU-19 Parámetros de seguridad diferenciados por entidad bancaria cliente.
// Un admin solo puede ver/editar la política de SU entidad — el backend
// lo rechaza con 403 si se intenta con el tenantId de otra
export function TenantSecurityParams() {
  const { tenant } = useAuth();
  const { data: current, loading: loadingCurrent, reload } = useAsyncData(
    () => apiRequest<SecurityPolicy>(`/security-policy/${tenant?.id}`),
    [tenant?.id],
  );

  const [lockoutMinutes, setLockoutMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (current) setLockoutMinutes(current.lockoutMinutes);
  }, [current]);

  const { run: submit, loading } = useAsyncAction(async () => {
    if (lockoutMinutes < 1 || lockoutMinutes > 120) {
      setError('El valor debe estar entre 1 y 120 minutos');
      throw new SilentValidationError();
    }
    setError(null);
    await apiRequest(`/security-policy/${tenant?.id}`, {
      method: 'PUT',
      body: JSON.stringify({ lockoutMinutes }),
    });
    reload();
  }, 'Configuración guardada');

  return (
    <div>
      <PageHeader
        title="Parámetros de seguridad de la entidad"
        huRef="HU-19"
        description={`Configuración de seguridad de ${tenant?.name ?? 'tu entidad'}.`}
      />
      {loadingCurrent && <LoadingState label="Cargando..." />}
      {!loadingCurrent && (
        <div className="card max-w-md space-y-4">
          <div>
            <label htmlFor="lockout-minutes" className="text-xs text-muted">Minutos de bloqueo tras intentos fallidos</label>
            <input
              id="lockout-minutes"
              className="input mt-1"
              type="number"
              value={lockoutMinutes}
              onChange={(e) => setLockoutMinutes(Number(e.target.value))}
            />
            {error && <p className="text-xs text-risk-high mt-1">{error}</p>}
          </div>
          <button className="btn-primary" onClick={() => submit()} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      )}
    </div>
  );
}
