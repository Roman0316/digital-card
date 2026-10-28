import type { Env } from './env.schema';

export interface ProbesConfig {
  eventLoopLagThresholdMs: number;
}

export function createProbesConfig(env: Env): ProbesConfig {
  return {
    eventLoopLagThresholdMs: env.EVENT_LOOP_LAG_THRESHOLD_MS,
  };
}
