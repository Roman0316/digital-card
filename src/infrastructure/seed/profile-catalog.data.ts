import type { ProfileCatalogDraft } from '../../domain/profile/interfaces/profile-catalog-draft.interface';
import { LinkKind } from '../../domain/profile/link-kind';
import { SkillCategory } from '../../domain/profile/skill-category';

export const profileCatalogDraft: ProfileCatalogDraft = {
  slug: 'roman-shestakov',
  name: 'Роман Шестаков',
  description:
    'Backend-разработчик на Node.js и TypeScript. Самостоятельно веду задачи от технической проработки и оценки до релиза и поддержки. Разрабатываю сервисы с нуля, работаю с микросервисами, очередями и интеграциями. Учитываю отказоустойчивость, идемпотентность и стоимость решений',
  links: [
    {
      kind: LinkKind.Github,
      label: 'GitHub',
      url: 'https://github.com/Roman0316',
      sortOrder: 0,
    },
    {
      kind: LinkKind.Telegram,
      label: 'Telegram',
      url: 'https://t.me/roman123qwerty',
      sortOrder: 1,
    },
  ],
  skills: [
    { name: 'TypeScript', category: SkillCategory.Language, sortOrder: 0 },
    { name: 'JavaScript', category: SkillCategory.Language, sortOrder: 1 },
    { name: 'Node.js', category: SkillCategory.Platform, sortOrder: 2 },
    { name: 'NestJS', category: SkillCategory.Framework, sortOrder: 3 },
    { name: 'Express.js', category: SkillCategory.Framework, sortOrder: 4 },
    { name: 'PostgreSQL', category: SkillCategory.Database, sortOrder: 5 },
    { name: 'Redis', category: SkillCategory.Database, sortOrder: 6 },
    { name: 'TypeORM', category: SkillCategory.Framework, sortOrder: 7 },
    { name: 'Sequelize', category: SkillCategory.Framework, sortOrder: 8 },
    { name: 'Docker', category: SkillCategory.Platform, sortOrder: 9 },
    { name: 'Jest', category: SkillCategory.Practice, sortOrder: 10 },
    { name: 'Swagger', category: SkillCategory.Practice, sortOrder: 11 },
    { name: 'Cloudflare', category: SkillCategory.Platform, sortOrder: 12 },
    { name: 'Google Cloud Pub/Sub', category: SkillCategory.Platform, sortOrder: 13 },
    { name: 'GraphQL', category: SkillCategory.Practice, sortOrder: 14 },
    { name: 'Prisma', category: SkillCategory.Framework, sortOrder: 15 },
  ],
  experience: [
    {
      company: 'AT Systems',
      position: 'Ведущий backend-разработчик',
      startDate: '2025-03-18',
      endDate: '2026-10-16',
      sortOrder: 0,
      achievements: [
        'Устранил перерасход доменов при блокировках: гибкие стратегии бана, замена доменов в связанных сущностях и управление пулами при миграции legacy-сервиса на NestJS',
        'Спроектировал и разработал с нуля сервис Telegram-алертов: шаблоны, подписки, webhook-кнопки, повторные отправки, rate limiting и обработка дубликатов',
        'Разработал единый шлюз к Cloudflare API: DNS, KV, Custom Hostnames, атомарный учёт квот API и очередь настройки SSL',
        'Реализовал API агрегации статистики и событийный контур на GCP Pub/Sub с топиками, подписками и dead-letter queues',
        'Разработал API таймлайна доменов на BigQuery с почасовым обновлением для графиков и анализа источников трафика',
        'Настроил мониторинг и алертинг на Prometheus и Grafana с уведомлениями в Telegram по сбоям, падению конверсии и убыточным связкам',
      ],
    },
    {
      company: 'НИЦ супер-ЭВМ и нейрокомпьютеров',
      position: 'Backend-разработчик',
      startDate: '2022-11-01',
      endDate: '2025-02-17',
      sortOrder: 1,
      achievements: [
        'Реализовал асинхронную выгрузку больших объёмов данных в XLSX через очереди BullMQ, вынеся формирование файлов из HTTP-запросов',
        'Разработал интеграцию с CRM с Circuit Breaker и идемпотентной обработкой вебхуков',
        'Оптимизировал keyset-пагинацию в PostgreSQL под условие сортировки и cursor-фильтр на больших объёмах',
        'Разгрузил API за счёт кеширования в Redis и предрасчитанных read-моделей',
        'Реализовал JWT-аутентификацию, RBAC и token blacklist с отзывом токенов до истечения срока',
        'Автоматизировал сборку и развёртывание через CI/CD и Docker',
      ],
    },
  ],
  projects: [
    {
      name: 'Платформа закупки и монетизации трафика',
      url: 'https://at-systems.pro/ru/',
      summary:
        'Высоконагруженная платформа на 30+ микросервисах: домены, Cloudflare, Pub/Sub, BigQuery и алертинг',
      skillNames: [
        'TypeScript',
        'Node.js',
        'NestJS',
        'PostgreSQL',
        'Redis',
        'Docker',
        'Cloudflare',
        'Google Cloud Pub/Sub',
      ],
      sortOrder: 0,
    },
    {
      name: 'Внутренняя ERP-система',
      url: 'https://superevm.ru',
      summary:
        'Backend для мониторинга продукции, управления сотрудниками, документов и обмена данными с CRM',
      skillNames: ['TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'Sequelize', 'Docker'],
      sortOrder: 1,
    },
    {
      name: 'Цифровая визитка',
      url: 'https://github.com/Roman0316',
      summary:
        'GraphQL API профиля на NestJS и Prisma. Вложенные данные читаются батчами, каталог применяется одной транзакцией при старте',
      skillNames: ['TypeScript', 'NestJS', 'GraphQL', 'PostgreSQL', 'Prisma', 'Docker'],
      sortOrder: 2,
    },
  ],
};
