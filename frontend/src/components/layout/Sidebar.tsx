import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const NAV_GROUPS: { label: string; items: { to: string; label: string; requires?: string }[] }[] = [
  {
    label: 'Autenticación',
    items: [{ to: '/security/password-policy', label: 'Política de contraseñas', requires: 'roles:write' }],
  },
  {
    label: 'Roles y permisos',
    items: [
      { to: '/roles', label: 'Roles', requires: 'roles:write' },
      { to: '/roles/assign', label: 'Asignación a usuarios', requires: 'users:write' },
    ],
  },
  {
    label: 'Auditoría',
    items: [
      { to: '/audit/log', label: 'Registro de accesos', requires: 'audit:read' },
      { to: '/audit/reports', label: 'Reportes exportables', requires: 'audit:read' },
      { to: '/audit/role-history', label: 'Historial de roles', requires: 'audit:read' },
    ],
  },
  {
    label: 'Multi-tenant',
    items: [{ to: '/tenants/new', label: 'Nueva entidad cliente', requires: 'users:write' }],
  },
  {
    label: 'Seguridad',
    items: [
      { to: '/security/alerts', label: 'Alertas de accesos', requires: 'roles:write' },
      { to: '/security/inactivity', label: 'Cuentas inactivas', requires: 'roles:write' },
      { to: '/security/tenant-params', label: 'Parámetros de la entidad', requires: 'roles:write' },
    ],
  },
  {
    label: 'Gestión del servicio',
    items: [{ to: '/dashboard/sla', label: 'Cumplimiento de SLA' }],
  },
  {
    label: 'Notificaciones',
    items: [{ to: '/notifications', label: 'Preferencias de notificación' }],
  },
  {
    label: 'Sesión',
    items: [{ to: '/sessions', label: 'Mis sesiones activas' }],
  },
];

export function Sidebar() {
  const { hasPermission } = useAuth();
  const [open, setOpen] = useState(false);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.requires || hasPermission(item.requires)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <button
        className="md:hidden fixed top-3 left-3 z-40 bg-ink text-white rounded p-2"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <aside
        className={`w-64 shrink-0 bg-ink text-white/90 min-h-screen py-6 px-4 fixed md:static z-30 transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="px-2 mb-8">
          <p className="font-display font-semibold text-white text-[15px] leading-tight">
            SecureBank
          </p>
          <p className="text-[11px] font-mono text-white/50 tracking-wide">
            GESTIÓN DE ACCESOS
          </p>
        </div>

        <nav className="space-y-6">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[11px] uppercase tracking-wide text-white/40">
                {group.label}
              </p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block px-2 py-1.5 rounded text-[13px] ${
                          isActive
                            ? 'bg-ink-soft text-white'
                            : 'text-white/70 hover:text-white hover:bg-ink-soft'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-20"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
