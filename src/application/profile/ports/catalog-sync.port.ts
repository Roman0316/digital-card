import type { ProfileCatalog } from '../../../domain/profile/profile-catalog';

export interface StoredCatalogHead {
  contentHash: string;
  version: number;
}

export interface CatalogSyncContext {
  acquireLock(key: bigint): Promise<void>;
  findHead(slug: string): Promise<StoredCatalogHead | null>;
  replace(
    catalog: ProfileCatalog,
    contentHash: string,
    expectedVersion: number | null,
  ): Promise<void>;
}

export interface UnitOfWork {
  run<T>(work: (context: CatalogSyncContext) => Promise<T>): Promise<T>;
}
