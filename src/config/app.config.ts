import type { Env } from './env.schema';

export interface AppConfig {
  name: string;
  nodeEnv: Env['NODE_ENV'];
  port: number;
  shutdownTimeoutMs: number;
  isProduction: boolean;
}

export function createAppConfig(env: Env): AppConfig {
  return {
    name: env.APP_NAME,
    nodeEnv: env.NODE_ENV,
    port: env.APP_PORT,
    shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    isProduction: env.NODE_ENV === 'production',
  };
}
