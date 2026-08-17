//Migrar base de datos antes de correr las pruebas de integración
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool';

export const TEST_PASSWORD = 'SecureBank123!';

export async function resetDatabase() {
  await pool.query(`
    TRUNCATE
      "audit_log_entries",
      "role_change_entries",
      "sla_metrics",
      "security_policies",
      "password_reset_tokens",
      "sessions",
      "users",
      "roles",
      "tenants"
    CASCADE;
  `);
}

export async function seedTenantWithAdmin() {
  const tenantId = 'test-tenant-1';
  const roleId = 'test-role-admin';
  const userId = 'test-user-admin';
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  await pool.query('INSERT INTO tenants (id, name) VALUES ($1, $2)', [tenantId, 'Banco de Prueba']);
  await pool.query(
    'INSERT INTO roles (id, name, permissions, "tenantId") VALUES ($1, $2, $3, $4)',
    [roleId, 'Administrador', ['users:manage', 'roles:manage', 'roles:write'], tenantId],
  );
  await pool.query(
    `INSERT INTO users (id, "fullName", email, "passwordHash", "mfaEnabled", "isActive", "roleId", "tenantId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, 'Admin de Prueba', 'admin@test.local', passwordHash, false, true, roleId, tenantId],
  );

  return { tenantId, roleId, userId, email: 'admin@test.local' };
}

export async function closePool() {
  await pool.end();
}
