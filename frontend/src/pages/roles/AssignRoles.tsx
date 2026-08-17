import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { apiRequest } from '@/api/client';
import type { Role, User } from '@/types/shared';

// HU-05 Asignar y revocar roles a usuarios.
export function AssignRoles() {
  const { data: users, loading, error, reload } = useAsyncData(() => apiRequest<User[]>('/users'));
  const { data: roles } = useAsyncData(() => apiRequest<Role[]>('/roles'));
  const [confirmingRevoke, setConfirmingRevoke] = useState<User | null>(null);

  const { run: changeRole, loading: changing } = useAsyncAction(
    async (userId: string, roleId: string) => {
      await apiRequest(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ roleId }),
      });
      reload();
    },
    'Rol actualizado',
  );

  const { run: revoke, loading: revoking } = useAsyncAction(
    async (userId: string) => {
      await apiRequest(`/users/${userId}/revoke`, { method: 'POST' });
      setConfirmingRevoke(null);
      reload();
    },
    'Rol revocado',
  );

  return (
    <div>
      <PageHeader
        title="Asignación de roles"
        huRef="HU-05"
        description="Asigna o revoca el rol de un usuario cuando cambia de puesto o sale de la institución."
      />

      {loading && <LoadingState label="Cargando usuarios..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && users && roles && (
        <div className="card">
          <table className="table-base">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol actual</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>
                    <select
                      className="input !py-1 !text-xs"
                      value={u.roleId}
                      disabled={changing || !u.isActive}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>{u.isActive ? 'Activo' : 'Revocado'}</td>
                  <td>
                    {u.isActive && (
                      <button
                        className="text-risk-high text-xs font-medium"
                        onClick={() => setConfirmingRevoke(u)}
                      >
                        Revocar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmingRevoke && (
        <Modal
          title={`¿Revocar el rol de ${confirmingRevoke.fullName}?`}
          description="Perderá acceso al sistema hasta que se le asigne un rol nuevamente."
          onClose={() => setConfirmingRevoke(null)}
        >
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setConfirmingRevoke(null)}>
              Cancelar
            </button>
            <button
              className="bg-risk-high text-white px-4 py-2 rounded text-sm font-medium"
              disabled={revoking}
              onClick={() => revoke(confirmingRevoke.id)}
            >
              {revoking ? 'Revocando...' : 'Sí, revocar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
