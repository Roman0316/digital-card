import type { Env } from './env.schema';

export interface LoggerConfig {
  level: Env['LOG_LEVEL'];
  pretty: boolean;
}

export function createLoggerConfig(env: Env): LoggerConfig {
  return {
    level: env.LOG_LEVEL,
    pretty: env.NODE_ENV === 'development',
  };
}
