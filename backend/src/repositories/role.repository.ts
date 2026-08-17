import { pool } from '../db/pool';
import type { Role } from '../types/shared';

export const roleRepository = {
  async findAllByTenant(tenantId: string): Promise<Role[]> {
    const { rows } = await pool.query(
      'SELECT id, name, permissions, "tenantId" FROM roles WHERE "tenantId" = $1 ORDER BY name',
      [tenantId],
    );
    return rows;
  },

  async findById(id: string): Promise<Role | null> {
    const { rows } = await pool.query(
      'SELECT id, name, permissions, "tenantId" FROM roles WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  },

  async findByName(tenantId: string, name: string): Promise<Role | null> {
    const { rows } = await pool.query(
      'SELECT id, name, permissions, "tenantId" FROM roles WHERE "tenantId" = $1 AND lower(name) = lower($2)',
      [tenantId, name],
    );
    return rows[0] ?? null;
  },

  async create(id: string, name: string, permissions: string[], tenantId: string): Promise<Role> {
    const { rows } = await pool.query(
      'INSERT INTO roles (id, name, permissions, "tenantId") VALUES ($1, $2, $3, $4) RETURNING id, name, permissions, "tenantId"',
      [id, name, permissions, tenantId],
    );
    return rows[0];
  },

  async update(id: string, name: string, permissions: string[]): Promise<Role | null> {
    const { rows } = await pool.query(
      'UPDATE roles SET name = $2, permissions = $3 WHERE id = $1 RETURNING id, name, permissions, "tenantId"',
      [id, name, permissions],
    );
    return rows[0] ?? null;
  },
};
