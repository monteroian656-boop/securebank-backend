import { pool } from '../db/pool';
import type { SecurityPolicy } from '../types/shared';

export const securityPolicyRepository = {
  async findByTenant(tenantId: string): Promise<SecurityPolicy | null> {
    const { rows } = await pool.query(
      `SELECT "tenantId", "minLength", "expirationDays", "requireComplexity", "inactivityDays", "lockoutMinutes"
       FROM security_policies WHERE "tenantId" = $1`,
      [tenantId],
    );
    return rows[0] ?? null;
  },

  async upsert(tenantId: string, patch: Partial<Omit<SecurityPolicy, 'tenantId'>>): Promise<SecurityPolicy> {
    const existing = await this.findByTenant(tenantId);
    const merged = {
      minLength: patch.minLength ?? existing?.minLength ?? 10,
      expirationDays: patch.expirationDays ?? existing?.expirationDays ?? 90,
      requireComplexity: patch.requireComplexity ?? existing?.requireComplexity ?? true,
      inactivityDays: patch.inactivityDays ?? existing?.inactivityDays ?? 60,
      lockoutMinutes: patch.lockoutMinutes ?? existing?.lockoutMinutes ?? 15,
    };

    const { rows } = await pool.query(
      `INSERT INTO security_policies ("tenantId", "minLength", "expirationDays", "requireComplexity", "inactivityDays", "lockoutMinutes")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("tenantId") DO UPDATE SET
         "minLength" = $2, "expirationDays" = $3, "requireComplexity" = $4,
         "inactivityDays" = $5, "lockoutMinutes" = $6
       RETURNING "tenantId", "minLength", "expirationDays", "requireComplexity", "inactivityDays", "lockoutMinutes"`,
      [tenantId, merged.minLength, merged.expirationDays, merged.requireComplexity, merged.inactivityDays, merged.lockoutMinutes],
    );
    return rows[0];
  },
};
