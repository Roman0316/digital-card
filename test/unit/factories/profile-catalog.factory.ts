import { LinkKind } from '../../../src/domain/profile/link-kind';
import type { ProfileCatalogDraft } from '../../../src/domain/profile/profile-catalog-draft';
import { SkillCategory } from '../../../src/domain/profile/skill-category';

export function createCatalogDraft(
  overrides: Partial<ProfileCatalogDraft> = {},
): ProfileCatalogDraft {
  return {
    slug: 'roman-shestakov',
    name: 'Роман Шестаков',
    description: 'Backend-инженер',
    links: [
      {
        kind: LinkKind.Github,
        label: 'GitHub',
        url: 'https://github.com/romanshestakov',
        sortOrder: 0,
      },
    ],
    skills: [{ name: 'NestJS', category: SkillCategory.Framework, sortOrder: 0 }],
    experience: [
      {
        company: 'Продуктовая разработка',
        position: 'Backend-инженер',
        startDate: '2023-03-01',
        endDate: null,
        sortOrder: 0,
        achievements: ['Собрал доменную модель отдельно от доставки'],
      },
    ],
    projects: [
      {
        name: 'Цифровая визитка',
        url: 'https://github.com/romanshestakov/digital-card',
        summary: null,
        skillNames: ['NestJS'],
        sortOrder: 0,
      },
    ],
    ...overrides,
  };
}
