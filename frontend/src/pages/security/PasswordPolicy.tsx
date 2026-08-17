import { useEffect, useState } from 'react';
import { z } from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { apiRequest } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { SilentValidationError } from '@/utils/errors';
import type { SecurityPolicy } from '@/types/shared';

const policySchema = z.object({
  minLength: z.number().int().positive('Debe ser un número positivo'),
  expirationDays: z.number().int().positive('Debe ser un número positivo'),
});

// HU-01 Configurar políticas de seguridad de contraseña.
// El rechazo de minLength < 8 lo valida el backend de verdad (no es
// una simulación del frontend) — ver security-policy.service.ts.
export function PasswordPolicy() {
  const { tenant } = useAuth();
  const { data: current, loading: loadingCurrent, reload } = useAsyncData(
    () => apiRequest<SecurityPolicy>(`/security-policy/${tenant?.id}`),
    [tenant?.id],
  );

  const [minLength, setMinLength] = useState(10);
  const [expirationDays, setExpirationDays] = useState(90);
  const [requireComplexity, setRequireComplexity] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (current) {
      setMinLength(current.minLength);
      setExpirationDays(current.expirationDays);
      setRequireComplexity(current.requireComplexity);
    }
  }, [current]);

  const { run: submit, loading, error: rejectionError } = useAsyncAction(async () => {
    const result = policySchema.safeParse({ minLength, expirationDays });
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      throw new SilentValidationError();
    }
    setFormError(null);
    await apiRequest(`/security-policy/${tenant?.id}`, {
      method: 'PUT',
      body: JSON.stringify({ minLength, expirationDays, requireComplexity }),
    });
    reload();
  }, 'Política de contraseñas guardada');

  return (
    <div>
      <PageHeader
        title="Política de contraseñas"
        huRef="HU-01"
        description="Longitud, complejidad y expiración aplicadas a todos los usuarios."
      />
      {loadingCurrent && <LoadingState label="Cargando política actual..." />}
      {!loadingCurrent && (
        <div className="card max-w-lg space-y-4">
          <div>
            <label htmlFor="min-length" className="text-xs text-muted">Longitud mínima</label>
            <input
              id="min-length"
              className="input mt-1"
              type="number"
              min={1}
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
            />
            <p className="text-xs text-muted mt-1">Probá un valor menor a 8 para ver el rechazo del backend.</p>
          </div>
          <div>
            <label htmlFor="expiration-days" className="text-xs text-muted">Expiración (días)</label>
            <input
              id="expiration-days"
              className="input mt-1"
              type="number"
              min={1}
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={requireComplexity}
              onChange={(e) => setRequireComplexity(e.target.checked)}
            />
            Requiere mayúsculas, números y símbolos
          </label>
          {formError && <p className="text-xs text-risk-high">{formError}</p>}
          {rejectionError && !formError && <p className="text-xs text-risk-high">{rejectionError}</p>}
          <button className="btn-primary" onClick={() => submit()} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar política'}
          </button>
        </div>
      )}
    </div>
  );
}
