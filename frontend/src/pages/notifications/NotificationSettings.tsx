import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAsyncAction } from '@/hooks/useAsyncAction';

interface SentNotification {
  id: string;
  event: string;
  sentAt: string;
  status: 'delivered' | 'retrying';
}

const demoNotifications: SentNotification[] = [
  { id: 'n_1', event: 'Rol "Auditor" modificado por Ana Solano', sentAt: '2026-08-01T10:00:00Z', status: 'delivered' },
  { id: 'n_2', event: 'Permiso crítico agregado a "Administrador"', sentAt: '2026-07-20T10:00:00Z', status: 'retrying' },
];

// HU-17 Notificaciones por correo ante cambios críticos en roles o permisos.
export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [email, setEmail] = useState('ana.solano@bancocr.fi.cr');

  const { run: submit, loading } = useAsyncAction(async () => {
    await new Promise((r) => setTimeout(r, 400));
  }, 'Preferencias de notificación guardadas');

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        huRef="HU-17"
        description="Alertas por correo cuando se modifican roles o permisos críticos."
      />

      <div className="card max-w-lg space-y-4 mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Notificarme por correo ante cambios críticos en roles o permisos
        </label>
        <div>
          <label htmlFor="notif-email" className="text-xs text-muted">
            Correo de notificación
          </label>
          <input
            id="notif-email"
            className="input mt-1"
            type="email"
            disabled={!enabled}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => submit()} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar preferencias'}
        </button>
      </div>

      <p className="text-xs text-muted uppercase tracking-wide mb-2">Últimas notificaciones enviadas</p>
      <div className="card">
        <table className="table-base">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {demoNotifications.map((n) => (
              <tr key={n.id}>
                <td>{n.event}</td>
                <td>{new Date(n.sentAt).toLocaleString('es-CR')}</td>
                <td>{n.status === 'delivered' ? 'Entregada' : 'Reintentando envío'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
