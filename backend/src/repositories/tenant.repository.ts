import { pool } from '../db/pool';
import type { Tenant } from '../types/shared';

export const tenantRepository = {
  async findAll(): Promise<Tenant[]> {
    const { rows } = await pool.query('SELECT id, name FROM tenants ORDER BY name');
    return rows;
  },

  async findById(id: string): Promise<Tenant | null> {
    const { rows } = await pool.query('SELECT id, name FROM tenants WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async findByName(name: string): Promise<Tenant | null> {
    const { rows } = await pool.query('SELECT id, name FROM tenants WHERE lower(name) = lower($1)', [name]);
    return rows[0] ?? null;
  },

  async create(id: string, name: string): Promise<Tenant> {
    const { rows } = await pool.query(
      'INSERT INTO tenants (id, name) VALUES ($1, $2) RETURNING id, name',
      [id, name],
    );
    return rows[0];
  },
};
