import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { SyncProfileCatalogUseCase } from '../../application/profile/sync-profile-catalog.use-case';
import { AppMetrics } from '../metrics/app-metrics';
import { DatabaseMigrator } from '../persistence/prisma/database-migrator';
import { RuntimeState } from '../runtime/runtime-state';

import { profileCatalogDraft } from './profile-catalog.data';

@Injectable()
export class ProfileBootstrapService implements OnApplicationBootstrap {
  constructor(
    private readonly migrator: DatabaseMigrator,
    private readonly syncProfileCatalog: SyncProfileCatalogUseCase,
    private readonly runtime: RuntimeState,
    private readonly metrics: AppMetrics,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProfileBootstrapService.name);
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.migrator.deploy();
      const result = await this.syncProfileCatalog.execute(profileCatalogDraft);
      this.metrics.catalogSync.inc({ result: result.status });
      this.runtime.markReady();
      this.logger.info({ status: result.status }, 'Profile catalog synchronized');
    } catch (error) {
      this.logger.error({ err: error }, 'Application bootstrap failed');
      throw error;
    }
  }
}
