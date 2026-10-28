export const SkillCategory = {
  Language: 'LANGUAGE',
  Framework: 'FRAMEWORK',
  Database: 'DATABASE',
  Platform: 'PLATFORM',
  Practice: 'PRACTICE',
} as const;

export type SkillCategory = (typeof SkillCategory)[keyof typeof SkillCategory];

const SKILL_CATEGORIES = new Set<string>(Object.values(SkillCategory));

export function isSkillCategory(value: string): value is SkillCategory {
  return SKILL_CATEGORIES.has(value);
}
