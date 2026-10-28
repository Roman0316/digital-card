import type { LinkKind } from './link-kind';
import type { SkillCategory } from './skill-category';

export interface ProfileSnapshot {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProfileLinkRecord {
  profileId: string;
  kind: LinkKind;
  label: string;
  url: string;
  sortOrder: number;
}

export interface SkillRecord {
  id: string;
  profileId: string;
  name: string;
  category: SkillCategory;
  sortOrder: number;
}

export interface ExperienceRecord {
  id: string;
  profileId: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
}

export interface AchievementRecord {
  experienceId: string;
  text: string;
  sortOrder: number;
}

export interface ProjectRecord {
  id: string;
  profileId: string;
  name: string;
  url: string;
  summary: string | null;
  sortOrder: number;
}

export interface ProjectSkillRecord {
  projectId: string;
  skill: SkillRecord;
}
