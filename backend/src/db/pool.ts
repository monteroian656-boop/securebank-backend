import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// listener de errores y evitar caídas en el proceso
pool.on('error', (err) => {
  console.error('Error inesperado en un cliente inactivo del pool de Postgres:', err);
});
