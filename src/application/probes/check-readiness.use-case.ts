import { Inject, Injectable } from '@nestjs/common';

import type { DatabaseHealthCheck, ReadinessState } from './interfaces/probe-checks.interface';
import type { ReadinessResult } from './interfaces/probe-result.interface';
import { DATABASE_HEALTH, READINESS_STATE } from './tokens';

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
