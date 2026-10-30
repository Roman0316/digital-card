import type { Env } from '../env.schema';

export interface LoggerConfig {
  level: Env['LOG_LEVEL'];
  pretty: boolean;
}
