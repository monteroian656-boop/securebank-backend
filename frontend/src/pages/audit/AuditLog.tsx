import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { apiRequest } from '@/api/client';
import type { AuditLogEntry } from '@/types/shared';

const PAGE_SIZE = 2;

// HU-06 Registro de auditoría de accesos.
export function AuditLog() {
  const [userId, setUserId] = useState('');
  const [appliedUserId, setAppliedUserId] = useState('');
  const [page, setPage] = useState(1);

  const { data: entries, loading, error, reload } = useAsyncData(
    () => {
      const qs = appliedUserId ? `?userId=${encodeURIComponent(appliedUserId)}` : '';
      return apiRequest<AuditLogEntry[]>(`/audit-logs${qs}`);
    },
    [appliedUserId],
  );

  const paged = useMemo(() => {
    if (!entries) return [];
    return entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [entries, page]);

  const totalPages = entries ? Math.max(1, Math.ceil(entries.length / PAGE_SIZE)) : 1;

  return (
    <div>
      <PageHeader
        title="Registro de auditoría"
        huRef="HU-06"
        description="Detecta actividad sospechosa y respalda el cumplimiento regulatorio."
      />
      <div className="card mb-4 flex gap-3">
        <input
          className="input !w-auto"
          placeholder="Filtrar por usuario (ej. u_1)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          className="btn-secondary"
          onClick={() => {
            setAppliedUserId(userId);
            setPage(1);
          }}
        >
          Filtrar
        </button>
      </div>

      {loading && <LoadingState label="Cargando registro..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && entries && entries.length === 0 && (
        <EmptyState title="Sin resultados" description="No hay eventos que coincidan con el filtro aplicado." />
      )}

      {!loading && !error && entries && entries.length > 0 && (
        <>
          <div className="card">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Resultado</th>
                  <th>IP</th>
                  <th>Fecha</th>
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((e) => (
                  <tr key={e.id} className={e.riskLevel === 'high' ? 'bg-risk-high/5' : ''}>
                    <td>{e.userId}</td>
                    <td>{e.action}</td>
                    <td>{e.result === 'success' ? 'Éxito' : 'Fallido'}</td>
                    <td>{e.ipAddress}</td>
                    <td>{new Date(e.createdAt).toLocaleString('es-CR')}</td>
                    <td><RiskBadge level={e.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                className="btn-secondary !py-1 !px-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                className="btn-secondary !py-1 !px-2"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
