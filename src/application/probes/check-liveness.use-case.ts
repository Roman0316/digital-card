import { Inject, Injectable } from '@nestjs/common';

import type { EventLoopHealthCheck } from './ports/probe-checks.port';
import { EVENT_LOOP_HEALTH } from './tokens';
import type { LivenessResult } from './types/probe-result';

@Injectable()
export class CheckLivenessUseCase {
  constructor(@Inject(EVENT_LOOP_HEALTH) private readonly eventLoop: EventLoopHealthCheck) {}

  execute(): LivenessResult {
    if (!this.eventLoop.isHealthy()) {
      return { ok: false, reason: 'event_loop' };
    }

    return { ok: true };
  }
}
