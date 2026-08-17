import { pool } from '../db/pool';
import type { RoleChangeEntry } from '../types/shared';

export const roleHistoryRepository = {
  //Se une con `roles` porque role_change_entries no tiene tenantId propio
  //Sin este filtro, cualquier entidad vería el historial de las demás
  async findAllByTenant(
    tenantId: string,
    filters: { roleId?: string; changedBy?: string },
  ): Promise<RoleChangeEntry[]> {
    const conditions = ['roles."tenantId" = $1'];
    const params: unknown[] = [tenantId];

    if (filters.roleId) {
      params.push(`%${filters.roleId}%`);
      conditions.push(`h."roleId" ILIKE $${params.length}`);
    }
    if (filters.changedBy) {
      params.push(`%${filters.changedBy}%`);
      conditions.push(`h."changedBy" ILIKE $${params.length}`);
    }

    const { rows } = await pool.query(
      `SELECT h.id, h."roleId", h."changedBy", h."previousState", h."newState", h."createdAt"
       FROM role_change_entries h
       JOIN roles ON roles.id = h."roleId"
       WHERE ${conditions.join(' AND ')}
       ORDER BY h."createdAt" DESC`,
      params,
    );
    return rows;
  },

  async create(entry: {
    id: string;
    roleId: string;
    changedBy: string;
    previousState: string;
    newState: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO role_change_entries (id, "roleId", "changedBy", "previousState", "newState")
       VALUES ($1, $2, $3, $4, $5)`,
      [entry.id, entry.roleId, entry.changedBy, entry.previousState, entry.newState],
    );
  },
};
