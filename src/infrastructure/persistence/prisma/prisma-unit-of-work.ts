import { Inject, Injectable } from '@nestjs/common';

import type { UnitOfWork } from '../../../application/profile/interfaces/catalog-sync.interface';
import type { DatabaseConfig } from '../../../config/interfaces/database-config.interface';
import { DATABASE_CONFIG } from '../../../config/tokens';

import { PrismaCatalogSyncContext } from './prisma-catalog-sync.context';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(DATABASE_CONFIG) private readonly databaseConfig: DatabaseConfig,
  ) {}

  run<T>(work: (context: PrismaCatalogSyncContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(
      (transaction) => work(new PrismaCatalogSyncContext(transaction)),
      {
        timeout: this.databaseConfig.transactionTimeoutMs,
      },
    );
  }
}
