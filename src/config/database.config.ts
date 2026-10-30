import type { Env } from './env.schema';
import type { DatabaseConfig } from './interfaces/database-config.interface';

export function createDatabaseConfig(env: Env): DatabaseConfig {
  return {
    url: env.DATABASE_URL,
    connectAttempts: env.DATABASE_CONNECT_ATTEMPTS,
    connectDelayMs: env.DATABASE_CONNECT_DELAY_MS,
    transactionTimeoutMs: env.DATABASE_TRANSACTION_TIMEOUT_MS,
    logQueries: env.DATABASE_LOG_QUERIES,
  };
}
