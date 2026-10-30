import { CATALOG_SCHEMA_VERSION, createContentHash } from './content-hash';
import { EmploymentPeriod } from './employment-period';
import {
  CatalogViolation,
  InvalidProfileCatalogError,
} from './errors/invalid-profile-catalog.error';
import { normalizeExternalUrl } from './external-url';
import type { ProfileCatalogDraft } from './interfaces/profile-catalog-draft.interface';
import type { ProfileCatalogSnapshot } from './interfaces/profile-catalog-snapshot.interface';
import { PROFILE_LIMITS } from './limits';
import { isLinkKind, type LinkKind } from './link-kind';
import { isSkillCategory, type SkillCategory } from './skill-category';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ProfileCatalog {
  private constructor(
    readonly snapshot: ProfileCatalogSnapshot,
    readonly contentHash: string,
  ) {}

  static create(draft: ProfileCatalogDraft): ProfileCatalog {
    const snapshot = normalizeCatalog(draft);
    return new ProfileCatalog(snapshot, createContentHash(snapshot));
  }

  get slug(): string {
    return this.snapshot.slug;
  }
}

function normalizeCatalog(draft: ProfileCatalogDraft): ProfileCatalogSnapshot {
  const slug = requireSlug(draft.slug);
  const name = requireText(draft.name, PROFILE_LIMITS.nameMaxLength, CatalogViolation.Name, 'Имя');
  const description = requireText(
    draft.description,
    PROFILE_LIMITS.descriptionMaxLength,
    CatalogViolation.Description,
    'Описание',
  );

  requireCollection(draft.links, 'ссылок');
  requireCollection(draft.skills, 'навыков');
  requireCollection(draft.experience, 'мест работы');
  requireCollection(draft.projects, 'проектов');

  const links = draft.links
    .map((link) => ({
      kind: requireLinkKind(link.kind),
      label: requireText(
        link.label,
        PROFILE_LIMITS.labelMaxLength,
        CatalogViolation.Link,
        'Подпись ссылки',
      ),
      url: normalizeExternalUrl(link.url),
      sortOrder: requireSortOrder(link.sortOrder),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const skills = draft.skills
    .map((skill) => ({
      name: requireText(
        skill.name,
        PROFILE_LIMITS.skillNameMaxLength,
        CatalogViolation.Skill,
        'Навык',
      ),
      category: requireSkillCategory(skill.category),
      sortOrder: requireSortOrder(skill.sortOrder),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const experience = draft.experience
    .map((item) => {
      const period = EmploymentPeriod.create(item.startDate, item.endDate);
      const achievements = item.achievements.map((achievement, index) => ({
        text: requireText(
          achievement,
          PROFILE_LIMITS.achievementMaxLength,
          CatalogViolation.Achievement,
          'Достижение',
        ),
        sortOrder: index,
      }));

      if (achievements.length === 0) {
        throw new InvalidProfileCatalogError(
          CatalogViolation.Achievement,
          `У роли «${item.position}» нет достижений`,
        );
      }

      requireUnique(
        achievements.map((achievement) => achievement.text.toLocaleLowerCase('ru')),
        CatalogViolation.Achievement,
        'Достижения внутри одной роли повторяются',
      );

      return {
        company: requireText(
          item.company,
          PROFILE_LIMITS.companyMaxLength,
          CatalogViolation.Experience,
          'Компания',
        ),
        position: requireText(
          item.position,
          PROFILE_LIMITS.positionMaxLength,
          CatalogViolation.Experience,
          'Должность',
        ),
        startDate: period.start.value,
        endDate: period.end?.value ?? null,
        sortOrder: requireSortOrder(item.sortOrder),
        achievements,
      };
    })
    .sort(
      (left, right) =>
        right.startDate.localeCompare(left.startDate) || left.sortOrder - right.sortOrder,
    );

  const projects = draft.projects
    .map((project) => ({
      name: requireText(
        project.name,
        PROFILE_LIMITS.projectNameMaxLength,
        CatalogViolation.Project,
        'Название проекта',
      ),
      url: normalizeExternalUrl(project.url),
      summary: optionalText(project.summary, PROFILE_LIMITS.projectSummaryMaxLength),
      skillNames: project.skillNames.map((skillName) =>
        requireText(
          skillName,
          PROFILE_LIMITS.skillNameMaxLength,
          CatalogViolation.Project,
          'Навык проекта',
        ),
      ),
      sortOrder: requireSortOrder(project.sortOrder),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  requireUnique(
    links.map((link) => link.sortOrder),
    CatalogViolation.SortOrder,
    'Порядок ссылок должен быть уникальным',
  );
  requireUnique(
    links.map((link) => `${link.kind}:${link.url}`),
    CatalogViolation.Link,
    'Ссылки повторяются',
  );
  requireUnique(
    skills.map((skill) => skill.sortOrder),
    CatalogViolation.SortOrder,
    'Порядок навыков должен быть уникальным',
  );
  requireUnique(
    skills.map((skill) => skill.name.toLocaleLowerCase('ru')),
    CatalogViolation.Skill,
    'Навыки повторяются',
  );
  requireUnique(
    experience.map((item) => item.sortOrder),
    CatalogViolation.SortOrder,
    'Порядок опыта работы должен быть уникальным',
  );
  requireUnique(
    experience.map(
      (item) =>
        `${item.company.toLocaleLowerCase('ru')}:${item.position.toLocaleLowerCase('ru')}:${item.startDate}`,
    ),
    CatalogViolation.Experience,
    'Одинаковые роли с одной датой начала повторяются',
  );
  requireUnique(
    projects.map((project) => project.sortOrder),
    CatalogViolation.SortOrder,
    'Порядок проектов должен быть уникальным',
  );
  requireUnique(
    projects.map((project) => project.name.toLocaleLowerCase('ru')),
    CatalogViolation.Project,
    'Названия проектов повторяются',
  );
  requireUnique(
    projects.map((project) => project.url),
    CatalogViolation.Project,
    'Ссылки проектов повторяются',
  );

  const openRoles = experience.filter((item) => item.endDate === null);
  if (openRoles.length > 1) {
    throw new InvalidProfileCatalogError(
      CatalogViolation.CurrentRole,
      'В визитке не может быть больше одной текущей роли без даты окончания',
    );
  }

  const skillsByName = new Map(
    skills.map((skill) => [skill.name.toLocaleLowerCase('ru'), skill.name]),
  );
  const skillOrderByName = new Map(skills.map((skill) => [skill.name, skill.sortOrder]));
  const resolvedProjects = projects.map((project) => ({
    ...project,
    skillNames: project.skillNames
      .map((skillName) => {
        const canonical = skillsByName.get(skillName.toLocaleLowerCase('ru'));
        if (!canonical) {
          throw new InvalidProfileCatalogError(
            CatalogViolation.Project,
            `Проект «${project.name}» ссылается на неизвестный навык «${skillName}»`,
          );
        }
        return canonical;
      })
      .sort(
        (left, right) => (skillOrderByName.get(left) ?? 0) - (skillOrderByName.get(right) ?? 0),
      ),
  }));

  for (const project of resolvedProjects) {
    requireUnique(
      project.skillNames.map((skillName) => skillName.toLocaleLowerCase('ru')),
      CatalogViolation.Project,
      `Навыки проекта «${project.name}» повторяются`,
    );
  }

  return {
    catalogVersion: CATALOG_SCHEMA_VERSION,
    slug,
    name,
    description,
    links,
    skills,
    experience,
    projects: resolvedProjects,
  };
}

function requireSlug(value: string): string {
  const slug = value.trim();
  if (!SLUG_PATTERN.test(slug) || slug.length > PROFILE_LIMITS.slugMaxLength) {
    throw new InvalidProfileCatalogError(
      CatalogViolation.Slug,
      'Слаг профиля должен состоять из строчных латинских букв, цифр и дефисов',
    );
  }
  return slug;
}

function requireText(
  value: string,
  maxLength: number,
  violation: CatalogViolation,
  label: string,
): string {
  const text = value.trim();
  if (text.length === 0 || text.length > maxLength) {
    throw new InvalidProfileCatalogError(violation, `${label} пустой или длиннее допустимого`);
  }
  return text;
}

function optionalText(value: string | null, maxLength: number): string | null {
  if (value === null) {
    return null;
  }
  const text = value.trim();
  if (text.length === 0) {
    return null;
  }
  if (text.length > maxLength) {
    throw new InvalidProfileCatalogError(
      CatalogViolation.Project,
      'Описание проекта длиннее допустимого',
    );
  }
  return text;
}

function requireCollection(values: readonly unknown[], label: string): void {
  if (values.length === 0 || values.length > PROFILE_LIMITS.collectionMaxSize) {
    throw new InvalidProfileCatalogError(
      CatalogViolation.Collection,
      `Список ${label} не может быть пустым или слишком большим`,
    );
  }
}

function requireSortOrder(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > PROFILE_LIMITS.sortOrderMax) {
    throw new InvalidProfileCatalogError(
      CatalogViolation.SortOrder,
      'Порядок сортировки задан неверно',
    );
  }
  return value;
}

function requireLinkKind(value: string): LinkKind {
  if (!isLinkKind(value)) {
    throw new InvalidProfileCatalogError(CatalogViolation.Link, 'Тип ссылки неизвестен');
  }
  return value;
}

function requireSkillCategory(value: string): SkillCategory {
  if (!isSkillCategory(value)) {
    throw new InvalidProfileCatalogError(CatalogViolation.Skill, 'Категория навыка неизвестна');
  }
  return value;
}

function requireUnique(
  values: readonly (string | number)[],
  violation: CatalogViolation,
  message: string,
): void {
  if (new Set(values).size !== values.length) {
    throw new InvalidProfileCatalogError(violation, message);
  }
}
