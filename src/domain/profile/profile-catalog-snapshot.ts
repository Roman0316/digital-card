import type { LinkKind } from './link-kind';
import type { SkillCategory } from './skill-category';

export interface ProfileLinkSnapshot {
  kind: LinkKind;
  label: string;
  url: string;
  sortOrder: number;
}

export interface SkillSnapshot {
  name: string;
  category: SkillCategory;
  sortOrder: number;
}

export interface AchievementSnapshot {
  text: string;
  sortOrder: number;
}

export interface ExperienceSnapshot {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
  achievements: readonly AchievementSnapshot[];
}

export interface ProjectSnapshot {
  name: string;
  url: string;
  summary: string | null;
  skillNames: readonly string[];
  sortOrder: number;
}

export interface ProfileCatalogSnapshot {
  catalogVersion: number;
  slug: string;
  name: string;
  description: string;
  links: readonly ProfileLinkSnapshot[];
  skills: readonly SkillSnapshot[];
  experience: readonly ExperienceSnapshot[];
  projects: readonly ProjectSnapshot[];
}
