import { useAuth } from '@/context/AuthContext';

// Muestra siempre la entidad bancaria activa
export function Topbar() {
  const { user, tenant, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 pl-16 md:pl-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Entidad:</span>
        <span className="font-mono font-medium text-text">
          {tenant?.name ?? '—'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-text">{user?.fullName}</span>
        <button onClick={logout} className="btn-secondary !py-1.5 !px-3">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
