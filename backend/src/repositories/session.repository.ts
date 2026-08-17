import { pool } from '../db/pool';

export interface SessionRow {
  id: string;
  userId: string;
  userAgent: string | null;
  createdAt: Date;
  revokedAt: Date | null;
}

export const sessionRepository = {
  async create(id: string, userId: string, userAgent?: string): Promise<SessionRow> {
    const { rows } = await pool.query(
      `INSERT INTO sessions (id, "userId", "userAgent") VALUES ($1, $2, $3)
       RETURNING id, "userId", "userAgent", "createdAt", "revokedAt"`,
      [id, userId, userAgent ?? null],
    );
    return rows[0];
  },

  async findById(id: string): Promise<SessionRow | null> {
    const { rows } = await pool.query(
      `SELECT id, "userId", "userAgent", "createdAt", "revokedAt" FROM sessions WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  },

  async findActiveByUser(userId: string): Promise<SessionRow[]> {
    const { rows } = await pool.query(
      `SELECT id, "userId", "userAgent", "createdAt", "revokedAt" FROM sessions
       WHERE "userId" = $1 AND "revokedAt" IS NULL ORDER BY "createdAt" DESC`,
      [userId],
    );
    return rows;
  },

  async revoke(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE sessions SET "revokedAt" = now() WHERE id = $1 AND "userId" = $2 AND "revokedAt" IS NULL`,
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await pool.query(
      `UPDATE sessions SET "revokedAt" = now() WHERE "userId" = $1 AND "revokedAt" IS NULL`,
      [userId],
    );
  },
};
