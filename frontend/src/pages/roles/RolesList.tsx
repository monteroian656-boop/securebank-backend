import { useState } from 'react';
import { z } from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { apiRequest } from '@/api/client';
import { AVAILABLE_PERMISSIONS } from '@/constants/permissions';
import type { Role } from '@/types/shared';
import { SilentValidationError } from '@/utils/errors';

const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  permissions: z.array(z.string()).min(1, 'Seleccioná al menos un permiso'),
});

// HU-04 Crear y editar roles con permisos específicos.
export function RolesList() {
  const { data: roles, loading, error, reload } = useAsyncData(() => apiRequest<Role[]>('/roles'));

  // null = cerrado, 'new' = creando, Role = editando ese rol
  const [editing, setEditing] = useState<Role | 'new' | null>(null);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const openNew = () => {
    setName('');
    setPermissions([]);
    setFormError(null);
    setEditing('new');
  };

  const openEdit = (role: Role) => {
    setName(role.name);
    setPermissions(role.permissions);
    setFormError(null);
    setEditing(role);
  };

  const { run: submit, loading: saving } = useAsyncAction(async () => {
    const result = roleSchema.safeParse({ name, permissions });
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      throw new SilentValidationError();
    }
    setFormError(null);

    if (editing && editing !== 'new') {
      await apiRequest(`/roles/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, permissions }),
      });
    } else {
      await apiRequest('/roles', {
        method: 'POST',
        body: JSON.stringify({ name, permissions }),
      });
    }
    setEditing(null);
    reload();
  }, editing && editing !== 'new' ? 'Rol actualizado' : 'Rol creado correctamente');

  const togglePermission = (p: string) => {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const outOfScope = permissions.includes('tenants:write') && !permissions.includes('users:write');

  return (
    <div>
      <PageHeader
        title="Roles"
        huRef="HU-04"
        description="Roles con permisos específicos bajo el principio de mínimo privilegio."
      />

      <div className="mb-4">
        <button className="btn-primary" onClick={editing ? () => setEditing(null) : openNew}>
          {editing ? 'Cancelar' : 'Nuevo rol'}
        </button>
      </div>

      {editing && (
        <div className="card max-w-lg mb-6 space-y-4">
          <p className="text-xs text-muted uppercase tracking-wide">
            {editing === 'new' ? 'Nuevo rol' : `Editando: ${(editing as Role).name}`}
          </p>
          <div>
            <label htmlFor="role-name" className="text-xs text-muted">Nombre del rol</label>
            <input id="role-name" className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-2">Permisos</label>
            <div className="space-y-1.5">
              {AVAILABLE_PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm font-mono">
                  <input
                    type="checkbox"
                    checked={permissions.includes(p)}
                    onChange={() => togglePermission(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
          {outOfScope && (
            <p className="text-xs text-risk-medium">
              Advertencia: este rol tendría permisos fuera del principio de mínimo privilegio
              habitual (gestión de entidades sin gestión de usuarios). Confirmá que es intencional.
            </p>
          )}
          {formError && <p className="text-xs text-risk-high">{formError}</p>}
          <button className="btn-primary" onClick={() => submit()} disabled={saving}>
            {saving ? 'Guardando...' : editing === 'new' ? 'Guardar rol' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {loading && <LoadingState label="Cargando roles..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && roles && roles.length === 0 && (
        <EmptyState title="No hay roles definidos" description="Creá el primero con el botón de arriba." />
      )}
      {!loading && !error && roles && roles.length > 0 && (
        <div className="card">
          <table className="table-base">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Permisos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.permissions.join(', ')}</td>
                  <td>
                    <button className="text-accent text-xs font-medium" onClick={() => openEdit(r)}>
                      Editar
                    </button>
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
