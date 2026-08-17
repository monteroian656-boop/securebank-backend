import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/sla.repository', () => ({
  slaRepository: {
    latestByTenant: vi.fn(),
    trendByTenant: vi.fn(),
  },
}));

import { slaService } from './sla.service';
import { slaRepository } from '../repositories/sla.repository';
import { NotFoundError } from '../utils/errors';

const TENANT = 'tenant-1';
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

describe('slaService.current (HU-13)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza cuando la entidad no tiene métricas registradas todavía', async () => {
    vi.mocked(slaRepository.latestByTenant).mockResolvedValue(null);

    await expect(slaService.current(TENANT)).rejects.toThrow(NotFoundError);
  });

  it('devuelve la métrica más reciente de la entidad', async () => {
    const metric = { tenantId: TENANT, availability: 99.95, avgResponseMs: 120 };
    vi.mocked(slaRepository.latestByTenant).mockResolvedValue(metric as any);

    const result = await slaService.current(TENANT);

    expect(result).toEqual(metric);
  });
});

describe('slaService.trend (HU-18)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('convierte cada fecha registrada al nombre del día de la semana correcto', async () => {
    const recordedAt = '2026-08-17T12:00:00.000Z'; // lunes
    vi.mocked(slaRepository.trendByTenant).mockResolvedValue([
      { recordedAt, availability: 99.9 },
    ] as any);

    const result = await slaService.trend(TENANT);

    const expectedDay = WEEKDAYS[new Date(recordedAt).getDay()];
    expect(result).toEqual([{ day: expectedDay, availability: 99.9 }]);
  });

  it('mapea varios puntos de la tendencia en el mismo orden recibido', async () => {
    vi.mocked(slaRepository.trendByTenant).mockResolvedValue([
      { recordedAt: '2026-08-10T00:00:00.000Z', availability: 99.0 },
      { recordedAt: '2026-08-11T00:00:00.000Z', availability: 99.5 },
    ] as any);

    const result = await slaService.trend(TENANT);

    expect(result).toHaveLength(2);
    expect(result[0].availability).toBe(99.0);
    expect(result[1].availability).toBe(99.5);
  });
});
