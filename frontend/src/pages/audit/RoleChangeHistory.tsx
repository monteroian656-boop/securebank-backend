import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { apiRequest } from '@/api/client';
import type { RoleChangeEntry } from '@/types/shared';

// HU-15 Historial de cambios a roles y permisos.
export function RoleChangeHistory() {
  const [filterRole, setFilterRole] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [appliedRole, setAppliedRole] = useState('');
  const [appliedUser, setAppliedUser] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data: history, loading, error, reload } = useAsyncData(() => {
    const qs = new URLSearchParams();
    if (appliedRole) qs.set('roleId', appliedRole);
    if (appliedUser) qs.set('changedBy', appliedUser);
    return apiRequest<RoleChangeEntry[]>(`/role-history?${qs.toString()}`);
  }, [appliedRole, appliedUser]);

  const applyFilters = () => {
    setAppliedRole(filterRole);
    setAppliedUser(filterUser);
  };

  const sorted = history
    ? [...history].sort((a, b) =>
        order === 'desc' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt),
      )
    : [];

  return (
    <div>
      <PageHeader
        title="Historial de cambios de roles"
        huRef="HU-15"
        description="Trazabilidad de modificaciones a roles y permisos de usuarios."
      />

      <div className="card mb-4 flex flex-wrap gap-3 items-center">
        <input
          className="input !w-auto"
          placeholder="Filtrar por rol (ej. r_auditor)"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        />
        <input
          className="input !w-auto"
          placeholder="Filtrar por usuario que modificó (ej. u_1)"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <button className="btn-secondary" onClick={applyFilters}>Filtrar</button>
        <button
          className="btn-secondary"
          onClick={() => setOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
        >
          Orden: {order === 'desc' ? 'Más reciente primero' : 'Más antiguo primero'}
        </button>
      </div>

      {loading && <LoadingState label="Cargando historial..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && sorted.length === 0 && (
        <EmptyState title="Sin cambios registrados" description="No hay historial para este filtro." />
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="card">
          <table className="table-base">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Modificado por</th>
                <th>Antes</th>
                <th>Después</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((h) => (
                <tr key={h.id}>
                  <td>{h.roleId}</td>
                  <td>{h.changedBy}</td>
                  <td>{h.previousState}</td>
                  <td>{h.newState}</td>
                  <td>{new Date(h.createdAt).toLocaleString('es-CR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
