import { describe, expect, it } from 'vitest';

import { createContentHash } from '../../../src/domain/profile/content-hash';
import {
  CatalogViolation,
  InvalidProfileCatalogError,
} from '../../../src/domain/profile/errors/invalid-profile-catalog.error';
import { ProfileCatalog } from '../../../src/domain/profile/profile-catalog';
import { createCatalogDraft } from '../factories/profile-catalog.factory';

describe('ProfileCatalog', () => {
  it('строит стабильный хеш содержимого', () => {
    const first = ProfileCatalog.create(createCatalogDraft());
    const second = ProfileCatalog.create(createCatalogDraft());

    expect(first.contentHash).toBe(second.contentHash);
    expect(first.contentHash).toHaveLength(64);
  });

  it('меняет хеш, когда меняется достижение', () => {
    const original = ProfileCatalog.create(createCatalogDraft());
    const changed = ProfileCatalog.create(
      createCatalogDraft({
        experience: [
          {
            company: 'Продуктовая разработка',
            position: 'Backend-инженер',
            startDate: '2023-03-01',
            endDate: null,
            sortOrder: 0,
            achievements: ['Другое достижение'],
          },
        ],
      }),
    );

    expect(changed.contentHash).not.toBe(original.contentHash);
  });

  it('не зависит от порядка ключей при хешировании', () => {
    expect(createContentHash({ b: 1, a: { d: 2, c: 3 } })).toBe(
      createContentHash({ a: { c: 3, d: 2 }, b: 1 }),
    );
  });

  it('отклоняет повторяющийся навык без учёта регистра', () => {
    expect(() =>
      ProfileCatalog.create(
        createCatalogDraft({
          skills: [
            { name: 'NestJS', category: 'FRAMEWORK', sortOrder: 0 },
            { name: 'nestjs', category: 'FRAMEWORK', sortOrder: 1 },
          ],
        }),
      ),
    ).toThrow(InvalidProfileCatalogError);
  });

  it('отклоняет две текущие роли', () => {
    try {
      ProfileCatalog.create(
        createCatalogDraft({
          experience: [
            {
              company: 'А',
              position: 'Backend-инженер',
              startDate: '2024-01-01',
              endDate: null,
              sortOrder: 0,
              achievements: ['Первая роль'],
            },
            {
              company: 'Б',
              position: 'Backend-инженер',
              startDate: '2022-01-01',
              endDate: null,
              sortOrder: 1,
              achievements: ['Вторая роль'],
            },
          ],
        }),
      );
      expect.fail('каталог должен быть отклонён');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidProfileCatalogError);
      expect((error as InvalidProfileCatalogError).violation).toBe(CatalogViolation.CurrentRole);
    }
  });

  it('отклоняет проект с неизвестным навыком', () => {
    expect(() =>
      ProfileCatalog.create(
        createCatalogDraft({
          projects: [
            {
              name: 'Цифровая визитка',
              url: 'https://github.com/romanshestakov/digital-card',
              summary: null,
              skillNames: ['Redis'],
              sortOrder: 0,
            },
          ],
        }),
      ),
    ).toThrow(InvalidProfileCatalogError);
  });
});
