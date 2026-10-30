export interface ReadinessResult {
  ok: boolean;
  reason?: 'starting' | 'database';
}

export interface LivenessResult {
  ok: boolean;
  reason?: 'event_loop';
}
