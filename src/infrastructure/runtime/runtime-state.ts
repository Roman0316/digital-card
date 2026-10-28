import { Injectable } from '@nestjs/common';

import type { ReadinessState } from '../../application/probes/ports/probe-checks.port';

@Injectable()
export class RuntimeState implements ReadinessState {
  private ready = false;

  markReady(): void {
    this.ready = true;
  }

  markNotReady(): void {
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }
}
