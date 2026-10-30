import type { Env } from './env.schema';
import type { AppConfig } from './interfaces/app-config.interface';

export function createAppConfig(env: Env): AppConfig {
  return {
    name: env.APP_NAME,
    nodeEnv: env.NODE_ENV,
    port: env.APP_PORT,
    shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
    isProduction: env.NODE_ENV === 'production',
  };
}
