import { Inject, Injectable } from '@nestjs/common';

import type { EventLoopHealthCheck } from './interfaces/probe-checks.interface';
import type { LivenessResult } from './interfaces/probe-result.interface';
import { EVENT_LOOP_HEALTH } from './tokens';

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
