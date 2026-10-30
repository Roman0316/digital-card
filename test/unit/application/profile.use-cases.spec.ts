import { describe, expect, it } from 'vitest';

import { PROFILE_CATALOG_LOCK_KEY } from '../../../src/application/profile/catalog-sync.constants';
import { GetProfileUseCase } from '../../../src/application/profile/get-profile.use-case';
import type {
  CatalogSyncContext,
  UnitOfWork,
} from '../../../src/application/profile/interfaces/catalog-sync.interface';
import type { ProfileLookup } from '../../../src/application/profile/interfaces/profile-reader.interface';
import { SyncProfileCatalogUseCase } from '../../../src/application/profile/sync-profile-catalog.use-case';
import { CatalogSyncStatus } from '../../../src/application/profile/types/catalog-sync-result';
import {
  CatalogSyncConflictError,
  ProfileNotFoundError,
} from '../../../src/application/shared/application-error';
import { ProfileCatalog } from '../../../src/domain/profile/profile-catalog';
import { createCatalogDraft } from '../factories/profile-catalog.factory';

describe('SyncProfileCatalogUseCase', () => {
  it('не открывает транзакцию для невалидного каталога', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const useCase = new SyncProfileCatalogUseCase(unitOfWork);

    await expect(useCase.execute(createCatalogDraft({ name: '   ' }))).rejects.toThrow();
    expect(unitOfWork.runs).toBe(0);
  });

  it('берёт блокировку до чтения и не перезаписывает тот же каталог', async () => {
    const catalog = ProfileCatalog.create(createCatalogDraft());
    const context = new FakeContext({ contentHash: catalog.contentHash, version: 1 });
    const useCase = new SyncProfileCatalogUseCase(new FakeUnitOfWork(context));

    await expect(useCase.execute(createCatalogDraft())).resolves.toEqual({
      status: CatalogSyncStatus.Unchanged,
    });
    expect(context.events).toEqual(['lock', 'head']);
    expect(context.lockKey).toBe(PROFILE_CATALOG_LOCK_KEY);
  });

  it('создаёт профиль, если записи ещё нет', async () => {
    const context = new FakeContext(null);
    const useCase = new SyncProfileCatalogUseCase(new FakeUnitOfWork(context));

    await expect(useCase.execute(createCatalogDraft())).resolves.toEqual({
      status: CatalogSyncStatus.Created,
    });
    expect(context.replacedVersion).toBeNull();
  });

  it('повторяет синхронизацию один раз после конфликта версий', async () => {
    const catalog = ProfileCatalog.create(createCatalogDraft());
    const context = new FakeContext({ contentHash: 'stale', version: 1 });
    context.failReplaceOnce = true;
    context.nextHead = { contentHash: catalog.contentHash, version: 2 };
    const useCase = new SyncProfileCatalogUseCase(new FakeUnitOfWork(context));

    await expect(useCase.execute(createCatalogDraft())).resolves.toEqual({
      status: CatalogSyncStatus.Unchanged,
    });
    expect(context.replaceCalls).toBe(1);
  });
});

describe('GetProfileUseCase', () => {
  it('возвращает профиль владельца визитки', async () => {
    const lookup: ProfileLookup = {
      async findBySlug(slug) {
        return { id: 'profile-1', slug, name: 'Роман Шестаков', description: 'Backend-инженер' };
      },
    };

    await expect(new GetProfileUseCase(lookup, 'roman-shestakov').execute()).resolves.toMatchObject(
      {
        name: 'Роман Шестаков',
      },
    );
  });

  it('сообщает, что профиль не найден', async () => {
    const lookup: ProfileLookup = {
      async findBySlug() {
        return null;
      },
    };
    await expect(new GetProfileUseCase(lookup, 'missing').execute()).rejects.toBeInstanceOf(
      ProfileNotFoundError,
    );
  });
});

class FakeUnitOfWork implements UnitOfWork {
  runs = 0;

  constructor(private readonly context: CatalogSyncContext = new FakeContext(null)) {}

  async run<T>(work: (context: CatalogSyncContext) => Promise<T>): Promise<T> {
    this.runs += 1;
    return work(this.context);
  }
}

class FakeContext implements CatalogSyncContext {
  events: string[] = [];
  lockKey: bigint | null = null;
  replacedVersion: number | null | undefined;
  replaceCalls = 0;
  failReplaceOnce = false;
  nextHead: { contentHash: string; version: number } | null = null;

  constructor(private head: { contentHash: string; version: number } | null) {}

  async acquireLock(key: bigint): Promise<void> {
    this.events.push('lock');
    this.lockKey = key;
  }

  async findHead(): Promise<{ contentHash: string; version: number } | null> {
    this.events.push('head');
    return this.head;
  }

  async replace(
    _catalog: ProfileCatalog,
    contentHash: string,
    expectedVersion: number | null,
  ): Promise<void> {
    this.events.push('replace');
    this.replaceCalls += 1;
    this.replacedVersion = expectedVersion;
    if (this.failReplaceOnce) {
      this.failReplaceOnce = false;
      this.head = this.nextHead;
      throw new CatalogSyncConflictError();
    }
    this.head = { contentHash, version: (expectedVersion ?? 0) + 1 };
  }
}
