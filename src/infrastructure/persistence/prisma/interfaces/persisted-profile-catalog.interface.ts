export interface PersistedAchievement {
  text: string;
  sortOrder: number;
}

export interface PersistedExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
  achievements: readonly PersistedAchievement[];
}

export interface PersistedSkill {
  name: string;
  category: string;
  sortOrder: number;
}

export interface PersistedLink {
  kind: string;
  label: string;
  url: string;
  sortOrder: number;
}

export interface PersistedProjectSkill {
  skill: { name: string };
}

export interface PersistedProject {
  name: string;
  url: string;
  summary: string | null;
  sortOrder: number;
  skills: readonly PersistedProjectSkill[];
}

export interface PersistedProfileCatalog {
  slug: string;
  name: string;
  description: string;
  links: readonly PersistedLink[];
  skills: readonly PersistedSkill[];
  experiences: readonly PersistedExperience[];
  projects: readonly PersistedProject[];
}
