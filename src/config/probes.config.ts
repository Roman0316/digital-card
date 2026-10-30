import type { Env } from './env.schema';
import type { ProbesConfig } from './interfaces/probes-config.interface';

export function createProbesConfig(env: Env): ProbesConfig {
  return {
    eventLoopLagThresholdMs: env.EVENT_LOOP_LAG_THRESHOLD_MS,
  };
}
