import {
  Injectable,
  type BeforeApplicationShutdown,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { RuntimeState } from './runtime-state';

@Injectable()
export class ShutdownCoordinator implements BeforeApplicationShutdown, OnApplicationShutdown {
  constructor(
    private readonly runtime: RuntimeState,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ShutdownCoordinator.name);
  }

  beforeApplicationShutdown(signal?: string): void {
    this.runtime.markNotReady();
    this.logger.info({ signal }, 'Shutting down');
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.info({ signal }, 'Shutdown complete');
  }
}
