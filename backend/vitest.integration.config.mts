import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['dotenv/config'],
    env: { NODE_ENV: 'test' },
    //Las pruebas de integración funcionan con la DB de Postgres, se deben correr en serie
    fileParallelism: false,
  },
});
