import type { LinkKind } from '../link-kind';
import type { SkillCategory } from '../skill-category';

export interface ProfileLinkDraft {
  kind: LinkKind;
  label: string;
  url: string;
  sortOrder: number;
}

export interface SkillDraft {
  name: string;
  category: SkillCategory;
  sortOrder: number;
}

export interface ExperienceDraft {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
  achievements: readonly string[];
}

export interface ProjectDraft {
  name: string;
  url: string;
  summary: string | null;
  skillNames: readonly string[];
  sortOrder: number;
}

export interface ProfileCatalogDraft {
  slug: string;
  name: string;
  description: string;
  links: readonly ProfileLinkDraft[];
  skills: readonly SkillDraft[];
  experience: readonly ExperienceDraft[];
  projects: readonly ProjectDraft[];
}
