import { monitorEventLoopDelay, type IntervalHistogram } from 'node:perf_hooks';

import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

import { isEventLoopLagAcceptable } from '../../application/probes/event-loop-lag';
import type { EventLoopHealthCheck } from '../../application/probes/ports/probe-checks.port';
import type { ProbesConfig } from '../../config/probes.config';
import { PROBES_CONFIG } from '../../config/tokens';

const HISTOGRAM_RESOLUTION_MS = 20;

@Injectable()
export class EventLoopMonitor implements EventLoopHealthCheck, OnModuleInit, OnModuleDestroy {
  private histogram: IntervalHistogram | null = null;

  constructor(@Inject(PROBES_CONFIG) private readonly config: ProbesConfig) {}

  onModuleInit(): void {
    this.histogram = monitorEventLoopDelay({ resolution: HISTOGRAM_RESOLUTION_MS });
    this.histogram.enable();
  }

  onModuleDestroy(): void {
    this.histogram?.disable();
  }

  isHealthy(): boolean {
    if (!this.histogram) {
      return true;
    }

    const lagMilliseconds = this.histogram.max / 1_000_000;
    this.histogram.reset();
    return isEventLoopLagAcceptable(lagMilliseconds, this.config.eventLoopLagThresholdMs);
  }
}
