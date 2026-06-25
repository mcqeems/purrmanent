import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { entities } from '../entities';

/**
 * Standalone DataSource used by the TypeORM migration CLI.
 * ponytail: use Node's built-in env-file loader (Node >= 20.12) instead of
 * pulling in `dotenv`. In production the real env vars are already set, so a
 * missing .env is non-fatal.
 */
try {
  (process as NodeJS.Process & { loadEnvFile?: () => void }).loadEnvFile?.();
} catch {
  // no .env file present (e.g. production) — rely on real environment vars
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
});
