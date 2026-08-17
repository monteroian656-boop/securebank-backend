// Carga los datos de demo desde prisma/seed.sql usando el mismo pool de conexión que el resto del backend
import fs from 'fs';
import path from 'path';
import { pool } from './pool';

async function main() {
  const sqlPath = path.join(__dirname, '../../prisma/seed.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  await pool.query(sql);
  console.log('Seed aplicado. Usuario de demo: ana.solano@bancocr.fi.cr / SecureBank123!');
  await pool.end();
}

main().catch((err) => {
  console.error('Error aplicando el seed:', err);
  process.exit(1);
});
