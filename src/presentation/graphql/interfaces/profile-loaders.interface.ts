import type DataLoader from 'dataloader';

import type {
  ExperienceModel,
  ProfileLinkModel,
  ProjectModel,
  SkillModel,
} from '../profile/profile.models';

export interface ProfileLoaders {
  links: DataLoader<string, ProfileLinkModel[]>;
  skills: DataLoader<string, SkillModel[]>;
  experience: DataLoader<string, ExperienceModel[]>;
  achievements: DataLoader<string, string[]>;
  projects: DataLoader<string, ProjectModel[]>;
  projectSkills: DataLoader<string, SkillModel[]>;
}
