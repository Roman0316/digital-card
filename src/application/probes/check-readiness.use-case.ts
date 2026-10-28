import { Inject, Injectable } from '@nestjs/common';

import type { DatabaseHealthCheck, ReadinessState } from './ports/probe-checks.port';
import { DATABASE_HEALTH, READINESS_STATE } from './tokens';
import type { ReadinessResult } from './types/probe-result';

@Injectable()
export class CheckReadinessUseCase {
  constructor(
    @Inject(READINESS_STATE) private readonly state: ReadinessState,
    @Inject(DATABASE_HEALTH) private readonly database: DatabaseHealthCheck,
  ) {}

  async execute(): Promise<ReadinessResult> {
    if (!this.state.isReady()) {
      return { ok: false, reason: 'starting' };
    }

    const databaseAvailable = await this.database.ping();
    if (!databaseAvailable) {
      return { ok: false, reason: 'database' };
    }

    return { ok: true };
  }
}
