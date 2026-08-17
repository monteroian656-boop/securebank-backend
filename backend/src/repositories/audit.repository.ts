import { pool } from '../db/pool';
import type { AuditLogEntry, RiskLevel } from '../types/shared';

export const auditRepository = {
  async findByTenant(
    tenantId: string,
    filters: { userId?: string; from?: string; to?: string },
  ): Promise<AuditLogEntry[]> {
    const conditions = ['"tenantId" = $1'];
    const params: unknown[] = [tenantId];

    if (filters.userId) {
      params.push(`%${filters.userId}%`);
      conditions.push(`"userId" ILIKE $${params.length}`);
    }
    // Se comapra la proporciónd de la fecha para que "hasta" incluya todo el día seleccionado
    if (filters.from) {
      params.push(filters.from);
      conditions.push(`"createdAt"::date >= $${params.length}::date`);
    }
    if (filters.to) {
      params.push(filters.to);
      conditions.push(`"createdAt"::date <= $${params.length}::date`);
    }

    const { rows } = await pool.query(
      `SELECT id, "userId", action, result, "ipAddress", "riskLevel", "createdAt"
       FROM audit_log_entries WHERE ${conditions.join(' AND ')}
       ORDER BY "createdAt" DESC`,
      params,
    );
    return rows;
  },

  async create(entry: {
    id: string;
    userId: string;
    action: string;
    result: 'success' | 'failure';
    ipAddress: string;
    riskLevel: RiskLevel;
    tenantId: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO audit_log_entries (id, "userId", action, result, "ipAddress", "riskLevel", "tenantId")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [entry.id, entry.userId, entry.action, entry.result, entry.ipAddress, entry.riskLevel, entry.tenantId],
    );
  },
};
