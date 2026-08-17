import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { apiRequest } from '@/api/client';
import type { AuditLogEntry } from '@/types/shared';

// HU-10 Alertas automáticas ante intentos fallidos repetidos.
export function FailedLoginAlerts() {
  const { data: entries, loading, error, reload } = useAsyncData(() => apiRequest<AuditLogEntry[]>('/audit-logs'));
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    if (!entries) return [];
    const failed = entries.filter((e) => e.result === 'failure');
    const order = { high: 0, medium: 1, low: 2 } as const;
    return [...failed].sort((a, b) => order[a.riskLevel] - order[b.riskLevel]);
  }, [entries]);

  const markReviewed = (id: string) => {
    setReviewed((prev) => new Set(prev).add(id));
  };

  return (
    <div>
      <PageHeader
        title="Alertas de accesos fallidos"
        huRef="HU-10"
        description="Notificaciones automáticas cuando se supera el umbral de intentos fallidos, ordenadas por severidad."
      />

      {loading && <LoadingState label="Cargando alertas..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && alerts.length === 0 && (
        <EmptyState title="Sin alertas" description="No hay intentos fallidos registrados." />
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="card">
          <table className="table-base">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>IP de origen</th>
                <th>Fecha</th>
                <th>Nivel</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className={reviewed.has(a.id) ? 'opacity-40' : ''}>
                  <td>{a.userId}</td>
                  <td>{a.ipAddress}</td>
                  <td>{new Date(a.createdAt).toLocaleString('es-CR')}</td>
                  <td><RiskBadge level={a.riskLevel} /></td>
                  <td>
                    {!reviewed.has(a.id) ? (
                      <button
                        className="text-accent text-xs font-medium"
                        onClick={() => markReviewed(a.id)}
                      >
                        Marcar revisada
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Revisada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
