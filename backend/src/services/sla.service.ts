import { slaRepository } from '../repositories/sla.repository';
import { NotFoundError } from '../utils/errors';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const slaService = {
  // HU-13: cumplimiento actual por entidad.
  async current(tenantId: string) {
    const metric = await slaRepository.latestByTenant(tenantId);
    if (!metric) throw new NotFoundError('No hay métricas de SLA para esta entidad todavía.');
    return metric;
  },

  // HU-18: tendencia para el gráfico del dashboard.
  async trend(tenantId: string) {
    const rows = await slaRepository.trendByTenant(tenantId);
    return rows.map((r) => ({
      day: WEEKDAYS[new Date(r.recordedAt).getDay()],
      availability: r.availability,
    }));
  },
};
