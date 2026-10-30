import type { Env } from './env.schema';
import type { LoggerConfig } from './interfaces/logger-config.interface';

export function createLoggerConfig(env: Env): LoggerConfig {
  return {
    level: env.LOG_LEVEL,
    pretty: env.NODE_ENV === 'development',
  };
}
