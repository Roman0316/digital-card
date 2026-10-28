import { Module } from '@nestjs/common';

import { GetProfileUseCase } from './application/profile/get-profile.use-case';
import { SyncProfileCatalogUseCase } from './application/profile/sync-profile-catalog.use-case';
import { PROFILE_LOOKUP, PROFILE_SLUG, UNIT_OF_WORK } from './application/profile/tokens';
import { MetricsModule } from './infrastructure/metrics/metrics.module';
import { PrismaProfileReader } from './infrastructure/persistence/prisma/prisma-profile.reader';
import { PrismaUnitOfWork } from './infrastructure/persistence/prisma/prisma-unit-of-work';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { ProfileBootstrapService } from './infrastructure/seed/profile-bootstrap.service';
import { profileCatalogDraft } from './infrastructure/seed/profile-catalog.data';

@Module({
  imports: [PrismaModule, MetricsModule],
  providers: [
    GetProfileUseCase,
    SyncProfileCatalogUseCase,
    ProfileBootstrapService,
    { provide: PROFILE_SLUG, useValue: profileCatalogDraft.slug },
    { provide: PROFILE_LOOKUP, useExisting: PrismaProfileReader },
    { provide: UNIT_OF_WORK, useExisting: PrismaUnitOfWork },
  ],
  exports: [GetProfileUseCase, SyncProfileCatalogUseCase, PROFILE_SLUG, PROFILE_LOOKUP],
})
export class ProfileModule {}
