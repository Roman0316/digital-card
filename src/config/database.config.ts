import type { Env } from './env.schema';

export interface DatabaseConfig {
  url: string;
  connectAttempts: number;
  connectDelayMs: number;
  transactionTimeoutMs: number;
  logQueries: boolean;
}

export function createDatabaseConfig(env: Env): DatabaseConfig {
  return {
    url: env.DATABASE_URL,
    connectAttempts: env.DATABASE_CONNECT_ATTEMPTS,
    connectDelayMs: env.DATABASE_CONNECT_DELAY_MS,
    transactionTimeoutMs: env.DATABASE_TRANSACTION_TIMEOUT_MS,
    logQueries: env.DATABASE_LOG_QUERIES,
  };
}
