import type { ProfileCatalogDraft } from '../../../domain/profile/interfaces/profile-catalog-draft.interface';
import { isLinkKind } from '../../../domain/profile/link-kind';
import { ProfileCatalog } from '../../../domain/profile/profile-catalog';
import { isSkillCategory } from '../../../domain/profile/skill-category';

import type { PersistedProfileCatalog } from './interfaces/persisted-profile-catalog.interface';

export function hashPersistedCatalog(profile: PersistedProfileCatalog): string | null {
  try {
    return ProfileCatalog.create(toDraft(profile)).contentHash;
  } catch {
    return null;
  }
}

function toDraft(profile: PersistedProfileCatalog): ProfileCatalogDraft {
  return {
    slug: profile.slug,
    name: profile.name,
    description: profile.description,
    links: profile.links.map((link) => ({
      kind: requireLinkKind(link.kind),
      label: link.label,
      url: link.url,
      sortOrder: link.sortOrder,
    })),
    skills: profile.skills.map((skill) => ({
      name: skill.name,
      category: requireSkillCategory(skill.category),
      sortOrder: skill.sortOrder,
    })),
    experience: profile.experiences.map((item) => ({
      company: item.company,
      position: item.position,
      startDate: item.startDate,
      endDate: item.endDate,
      sortOrder: item.sortOrder,
      achievements: [...item.achievements]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((achievement) => achievement.text),
    })),
    projects: profile.projects.map((project) => ({
      name: project.name,
      url: project.url,
      summary: project.summary,
      skillNames: project.skills.map((item) => item.skill.name),
      sortOrder: project.sortOrder,
    })),
  };
}

function requireLinkKind(value: string): ProfileCatalogDraft['links'][number]['kind'] {
  if (!isLinkKind(value)) {
    throw new Error(`Неизвестный тип ссылки: ${value}`);
  }
  return value;
}

function requireSkillCategory(value: string): ProfileCatalogDraft['skills'][number]['category'] {
  if (!isSkillCategory(value)) {
    throw new Error(`Неизвестная категория навыка: ${value}`);
  }
  return value;
}
