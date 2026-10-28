import { Module } from '@nestjs/common';

import { DatabaseMigrator } from './database-migrator';
import { PrismaDatabaseHealth } from './prisma-database-health';
import { PrismaProfileReader } from './prisma-profile.reader';
import { PrismaUnitOfWork } from './prisma-unit-of-work';
import { PrismaService } from './prisma.service';

@Module({
  providers: [
    PrismaService,
    DatabaseMigrator,
    PrismaUnitOfWork,
    PrismaProfileReader,
    PrismaDatabaseHealth,
  ],
  exports: [
    PrismaService,
    DatabaseMigrator,
    PrismaUnitOfWork,
    PrismaProfileReader,
    PrismaDatabaseHealth,
  ],
})
export class PrismaModule {}
