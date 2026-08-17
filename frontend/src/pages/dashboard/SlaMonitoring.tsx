import { useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TrendSparkline } from '@/components/ui/TrendSparkline';
import { useAsyncData } from '@/hooks/useAsyncData';
import { apiRequest } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { SlaMetric } from '@/types/shared';

interface TrendPoint {
  day: string;
  availability: number;
}

// HU-13 Monitorear cumplimiento de SLA por entidad
// HU-18 Dashboard de métricas de accesos y auditoría en tiempo real
// un admin bancario solo ve su propia entidad, nunca la de otro banco
export function SlaMonitoring() {
  const { tenant } = useAuth();
  const { data: sla, loading, error, reload } = useAsyncData(() => apiRequest<SlaMetric[]>('/sla'));
  const { data: trend } = useAsyncData(() => apiRequest<TrendPoint[]>('/sla/trend'));

  useEffect(() => {
    const interval = setInterval(reload, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metric = sla?.[0];

  return (
    <div>
      <PageHeader
        title="Cumplimiento de SLA"
        huRef="HU-13 · HU-18"
        description={`Disponibilidad, tiempos de respuesta y métricas de seguridad de ${tenant?.name ?? 'tu entidad'}.`}
      />

      {loading && <LoadingState label="Cargando métricas..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && metric && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-xs text-muted mb-1">Disponibilidad</p>
              <p className="text-2xl font-display font-semibold">{metric.availability}%</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted mb-1">Tiempo de respuesta prom.</p>
              <p className="text-2xl font-display font-semibold">{metric.avgResponseMs} ms</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted mb-1">Estado de SLA</p>
              <p className={`text-2xl font-display font-semibold ${metric.breached ? 'text-risk-high' : 'text-risk-low'}`}>
                {metric.breached ? 'Incumplido' : 'Cumplido'}
              </p>
            </div>
          </div>

          {trend && trend.length > 0 && (
            <div className="card">
              <p className="text-xs text-muted mb-3">Disponibilidad — últimos días</p>
              <TrendSparkline data={trend} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
