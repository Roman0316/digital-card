import { Inject, Injectable } from '@nestjs/common';

import type { ProfileCatalogDraft } from '../../domain/profile/interfaces/profile-catalog-draft.interface';
import { ProfileCatalog } from '../../domain/profile/profile-catalog';
import { CatalogSyncConflictError } from '../shared/application-error';

import { PROFILE_CATALOG_LOCK_KEY } from './catalog-sync.constants';
import type { CatalogSyncResult } from './interfaces/catalog-sync-result.interface';
import type { CatalogSyncContext, UnitOfWork } from './interfaces/catalog-sync.interface';
import { UNIT_OF_WORK } from './tokens';
import { CatalogSyncStatus } from './types/catalog-sync-result';

@Injectable()
export class SyncProfileCatalogUseCase {
  constructor(@Inject(UNIT_OF_WORK) private readonly unitOfWork: UnitOfWork) {}

  async execute(draft: ProfileCatalogDraft): Promise<CatalogSyncResult> {
    const catalog = ProfileCatalog.create(draft);

    try {
      return await this.syncOnce(catalog);
    } catch (error) {
      if (!(error instanceof CatalogSyncConflictError)) {
        throw error;
      }
      return this.syncOnce(catalog);
    }
  }

  private syncOnce(catalog: ProfileCatalog): Promise<CatalogSyncResult> {
    return this.unitOfWork.run((context) => this.syncInsideTransaction(context, catalog));
  }

  private async syncInsideTransaction(
    context: CatalogSyncContext,
    catalog: ProfileCatalog,
  ): Promise<CatalogSyncResult> {
    await context.acquireLock(PROFILE_CATALOG_LOCK_KEY);
    const head = await context.findHead(catalog.slug);

    if (head?.contentHash === catalog.contentHash) {
      return { status: CatalogSyncStatus.Unchanged };
    }

    await context.replace(catalog, catalog.contentHash, head?.version ?? null);
    return { status: head ? CatalogSyncStatus.Updated : CatalogSyncStatus.Created };
  }
}
