import type { Env } from '../env.schema';

export interface AppConfig {
  name: string;
  nodeEnv: Env['NODE_ENV'];
  port: number;
  shutdownTimeoutMs: number;
  isProduction: boolean;
}
