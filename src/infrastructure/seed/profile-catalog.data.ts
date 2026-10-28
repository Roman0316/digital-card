import { LinkKind } from '../../domain/profile/link-kind';
import type { ProfileCatalogDraft } from '../../domain/profile/profile-catalog-draft';
import { SkillCategory } from '../../domain/profile/skill-category';

export const profileCatalogDraft: ProfileCatalogDraft = {
  slug: 'roman-shestakov',
  name: 'Роман Шестаков',
  description:
    'Backend-инженер. Проектирую сервисы на Node.js и NestJS так, чтобы доменная логика не зависела от HTTP и базы, а согласованность данных держалась на транзакциях и ограничениях, а не на удачном порядке запросов',
  links: [
    {
      kind: LinkKind.Github,
      label: 'GitHub',
      url: 'https://github.com/romanshestakov',
      sortOrder: 0,
    },
    {
      kind: LinkKind.Linkedin,
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/romanshestakov',
      sortOrder: 1,
    },
  ],
  skills: [
    { name: 'TypeScript', category: SkillCategory.Language, sortOrder: 0 },
    { name: 'Node.js', category: SkillCategory.Platform, sortOrder: 1 },
    { name: 'NestJS', category: SkillCategory.Framework, sortOrder: 2 },
    { name: 'PostgreSQL', category: SkillCategory.Database, sortOrder: 3 },
    { name: 'Prisma', category: SkillCategory.Framework, sortOrder: 4 },
    { name: 'GraphQL', category: SkillCategory.Practice, sortOrder: 5 },
    { name: 'Docker', category: SkillCategory.Platform, sortOrder: 6 },
  ],
  experience: [
    {
      company: 'Продуктовая разработка',
      position: 'Backend-инженер',
      startDate: '2023-03-01',
      endDate: null,
      sortOrder: 0,
      achievements: [
        'Собирал серверные модули на NestJS с отдельной доменной моделью и тонким слоем доставки',
        'Закрывал конкурентные сценарии в PostgreSQL: уникальные ограничения, блокировки и идемпотентная запись каталога',
        'Оставлял в наблюдаемости только полезный сигнал: ошибки, задержка запросов и готовность зависимостей',
      ],
    },
    {
      company: 'Продуктовая разработка',
      position: 'Backend-разработчик',
      startDate: '2020-06-01',
      endDate: '2023-02-28',
      sortOrder: 1,
      achievements: [
        'Развивал внутренние сервисы на Node.js и PostgreSQL и доводил повторные операции до предсказуемого результата',
        'Разделял чтение вложенных данных так, чтобы клиент не тянул из базы связи, которые не запрашивал',
      ],
    },
  ],
  projects: [
    {
      name: 'Цифровая визитка',
      url: 'https://github.com/romanshestakov/digital-card',
      summary:
        'GraphQL API профиля. Вложенные навыки, опыт и проекты читаются батчами, а каталог применяется одной транзакцией при старте',
      skillNames: ['TypeScript', 'NestJS', 'GraphQL', 'PostgreSQL', 'Prisma', 'Docker'],
      sortOrder: 0,
    },
    {
      name: 'Внутренние backend-сервисы',
      url: 'https://github.com/romanshestakov',
      summary:
        'Сервисы вокруг доменных операций, где граница транзакции и контракт API не смешаны с деталями хранения',
      skillNames: ['Node.js', 'NestJS', 'PostgreSQL', 'Docker'],
      sortOrder: 1,
    },
  ],
};
