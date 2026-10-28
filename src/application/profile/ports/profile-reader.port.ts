import type {
  AchievementRecord,
  ExperienceRecord,
  ProfileLinkRecord,
  ProfileSnapshot,
  ProjectRecord,
  ProjectSkillRecord,
  SkillRecord,
} from '../../../domain/profile/profile-read-model';

export interface ProfileLookup {
  findBySlug(slug: string): Promise<ProfileSnapshot | null>;
}

export interface ProfileRelations {
  findLinks(profileIds: readonly string[]): Promise<readonly ProfileLinkRecord[]>;
  findSkills(profileIds: readonly string[]): Promise<readonly SkillRecord[]>;
  findExperience(profileIds: readonly string[]): Promise<readonly ExperienceRecord[]>;
  findAchievements(experienceIds: readonly string[]): Promise<readonly AchievementRecord[]>;
  findProjects(profileIds: readonly string[]): Promise<readonly ProjectRecord[]>;
  findProjectSkills(projectIds: readonly string[]): Promise<readonly ProjectSkillRecord[]>;
}
