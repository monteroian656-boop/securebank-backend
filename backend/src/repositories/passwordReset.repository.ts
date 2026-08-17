import { pool } from '../db/pool';

export interface PasswordResetTokenRow {
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export const passwordResetRepository = {
  async create(token: string, userId: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO password_reset_tokens (token, "userId", "expiresAt") VALUES ($1, $2, $3)`,
      [token, userId, expiresAt],
    );
  },

  async findByToken(token: string): Promise<PasswordResetTokenRow | null> {
    const { rows } = await pool.query(
      `SELECT token, "userId", "expiresAt", "usedAt" FROM password_reset_tokens WHERE token = $1`,
      [token],
    );
    return rows[0] ?? null;
  },

  async markUsed(token: string): Promise<void> {
    await pool.query(`UPDATE password_reset_tokens SET "usedAt" = now() WHERE token = $1`, [token]);
  },
};
