import type { ProfileCatalogDraft } from '../../../src/domain/profile/interfaces/profile-catalog-draft.interface';
import { LinkKind } from '../../../src/domain/profile/link-kind';
import { SkillCategory } from '../../../src/domain/profile/skill-category';

export function createCatalogDraft(
  overrides: Partial<ProfileCatalogDraft> = {},
): ProfileCatalogDraft {
  return {
    slug: 'roman-shestakov',
    name: 'Роман Шестаков',
    description: 'Backend-разработчик на Node.js и TypeScript',
    links: [
      {
        kind: LinkKind.Github,
        label: 'GitHub',
        url: 'https://github.com/Roman0316',
        sortOrder: 0,
      },
    ],
    skills: [{ name: 'NestJS', category: SkillCategory.Framework, sortOrder: 0 }],
    experience: [
      {
        company: 'AT Systems',
        position: 'Ведущий backend-разработчик',
        startDate: '2025-03-01',
        endDate: '2026-10-01',
        sortOrder: 0,
        achievements: ['Собрал доменную модель отдельно от доставки'],
      },
    ],
    projects: [
      {
        name: 'Цифровая визитка',
        url: 'https://github.com/Roman0316',
        summary: null,
        skillNames: ['NestJS'],
        sortOrder: 0,
      },
    ],
    ...overrides,
  };
}
