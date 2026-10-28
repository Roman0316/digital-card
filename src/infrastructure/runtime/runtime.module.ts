import { Global, Module } from '@nestjs/common';

import { EVENT_LOOP_HEALTH, READINESS_STATE } from '../../application/probes/tokens';

import { EventLoopMonitor } from './event-loop-monitor';
import { RuntimeState } from './runtime-state';
import { ShutdownCoordinator } from './shutdown-coordinator';

@Global()
@Module({
  providers: [
    RuntimeState,
    EventLoopMonitor,
    ShutdownCoordinator,
    { provide: READINESS_STATE, useExisting: RuntimeState },
    { provide: EVENT_LOOP_HEALTH, useExisting: EventLoopMonitor },
  ],
  exports: [RuntimeState, READINESS_STATE, EVENT_LOOP_HEALTH],
})
export class RuntimeModule {}
