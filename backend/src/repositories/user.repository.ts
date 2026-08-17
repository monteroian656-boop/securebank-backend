import { pool } from '../db/pool';
import type { User } from '../types/shared';

//Fila de la tabla `users`, incluye campos internos que nunca se exponen
//al frontend (passwordHash, failedLoginAttempts).
export interface UserRow extends User {
  passwordHash: string;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

const PUBLIC_COLUMNS = `id, "fullName", email, "isActive", "roleId", "tenantId", "createdAt"`;

export const userRepository = {
  async findAllByTenant(tenantId: string): Promise<User[]> {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM users WHERE "tenantId" = $1 ORDER BY "fullName"`,
      [tenantId],
    );
    return rows;
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
  },

  async findByEmailWithAuth(email: string): Promise<UserRow | null> {
    const { rows } = await pool.query(
      `SELECT id, "fullName", email, "isActive", "roleId", "tenantId", "createdAt",
              "passwordHash", "mfaEnabled", "failedLoginAttempts", "lockedUntil"
       FROM users WHERE lower(email) = lower($1)`,
      [email],
    );
    return rows[0] ?? null;
  },

  async updateRole(id: string, tenantId: string, roleId: string): Promise<User | null> {
    const { rows } = await pool.query(
      `UPDATE users SET "roleId" = $3 WHERE id = $1 AND "tenantId" = $2 RETURNING ${PUBLIC_COLUMNS}`,
      [id, tenantId, roleId],
    );
    return rows[0] ?? null;
  },

  async revoke(id: string, tenantId: string): Promise<User | null> {
    const { rows } = await pool.query(
      `UPDATE users SET "isActive" = false WHERE id = $1 AND "tenantId" = $2 RETURNING ${PUBLIC_COLUMNS}`,
      [id, tenantId],
    );
    return rows[0] ?? null;
  },

  async registerFailedLogin(id: string, attempts: number, lockedUntil: Date | null): Promise<void> {
    await pool.query(
      'UPDATE users SET "failedLoginAttempts" = $2, "lockedUntil" = $3 WHERE id = $1',
      [id, attempts, lockedUntil],
    );
  },

  async resetFailedLogins(id: string): Promise<void> {
    await pool.query(
      'UPDATE users SET "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE id = $1',
      [id],
    );
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await pool.query('UPDATE users SET "passwordHash" = $2 WHERE id = $1', [id, passwordHash]);
  },

  async findInactiveSince(tenantId: string, cutoff: Date): Promise<User[]> {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} FROM users
       WHERE "tenantId" = $1 AND "isActive" = true AND "createdAt" < $2`,
      [tenantId, cutoff],
    );
    return rows;
  },
};
