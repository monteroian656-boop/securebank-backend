// Aplica en orden los archivos migration.sql de /prisma/migrations que
// todavía no se hayan aplicado

import fs from 'fs';
import path from 'path';
import { pool } from './pool';

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "_migrations" (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  const migrationsDir = path.join(__dirname, '../../prisma/migrations');
  const folders = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const folder of folders) {
    const { rows } = await pool.query('SELECT 1 FROM "_migrations" WHERE name = $1', [folder]);
    if (rows.length > 0) {
      console.log(`↷ ya aplicada: ${folder}`);
      continue;
    }
    const sqlPath = path.join(migrationsDir, folder, 'migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log(`→ aplicando: ${folder}`);
    await pool.query(sql);
    await pool.query('INSERT INTO "_migrations" (name) VALUES ($1)', [folder]);
  }

  console.log('Migraciones al día.');
  await pool.end();
}

main().catch((err) => {
  console.error('Error aplicando migraciones:', err);
  process.exit(1);
});
