import { describe, expect, it } from 'vitest';

import { CheckLivenessUseCase } from '../../../src/application/probes/check-liveness.use-case';
import { CheckReadinessUseCase } from '../../../src/application/probes/check-readiness.use-case';
import { isEventLoopLagAcceptable } from '../../../src/application/probes/event-loop-lag';
import type {
  DatabaseHealthCheck,
  EventLoopHealthCheck,
  ReadinessState,
} from '../../../src/application/probes/interfaces/probe-checks.interface';

describe('пробы', () => {
  it('считает лаг выше порога фатальным', () => {
    expect(isEventLoopLagAcceptable(2_001, 2_000)).toBe(false);
    expect(isEventLoopLagAcceptable(20, 2_000)).toBe(true);
  });

  it('не готов, пока каталог не применён', async () => {
    const result = await new CheckReadinessUseCase(state(false), database(true)).execute();
    expect(result).toEqual({ ok: false, reason: 'starting' });
  });

  it('не готов, если база не отвечает', async () => {
    const result = await new CheckReadinessUseCase(state(true), database(false)).execute();
    expect(result).toEqual({ ok: false, reason: 'database' });
  });

  it('жив, только когда event loop в норме', () => {
    expect(new CheckLivenessUseCase(eventLoop(false)).execute()).toEqual({
      ok: false,
      reason: 'event_loop',
    });
    expect(new CheckLivenessUseCase(eventLoop(true)).execute()).toEqual({ ok: true });
  });
});

function state(ready: boolean): ReadinessState {
  return { isReady: () => ready };
}

function database(ok: boolean): DatabaseHealthCheck {
  return { ping: async () => ok };
}

function eventLoop(healthy: boolean): EventLoopHealthCheck {
  return { isHealthy: () => healthy };
}
