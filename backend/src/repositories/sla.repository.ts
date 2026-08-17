import { pool } from '../db/pool';
import type { SlaMetric } from '../types/shared';

export const slaRepository = {
  async latestByTenant(tenantId: string): Promise<SlaMetric | null> {
    const { rows } = await pool.query(
      `SELECT "tenantId", availability, "avgResponseMs", breached
       FROM sla_metrics WHERE "tenantId" = $1 ORDER BY "recordedAt" DESC LIMIT 1`,
      [tenantId],
    );
    return rows[0] ?? null;
  },

  async trendByTenant(tenantId: string, days = 7): Promise<{ recordedAt: Date; availability: number }[]> {
    const { rows } = await pool.query(
      `SELECT "recordedAt", availability FROM sla_metrics
       WHERE "tenantId" = $1 ORDER BY "recordedAt" DESC LIMIT $2`,
      [tenantId, days],
    );
    return rows.reverse();
  },
};
