import { isCurrentEmployment } from '../../../domain/profile/employment-period';
import type {
  ExperienceRecord,
  ProfileLinkRecord,
  ProfileSnapshot,
  ProjectRecord,
  SkillRecord,
} from '../../../domain/profile/interfaces/profile-read-model.interface';
import { LinkKind } from '../../../domain/profile/link-kind';
import { SkillCategory } from '../../../domain/profile/skill-category';

import type {
  ExperienceModel,
  ProfileLinkModel,
  ProfileModel,
  ProjectModel,
  SkillModel,
} from './profile.models';
import { LinkKindModel, SkillCategoryModel } from './profile.models';

export function toProfileModel(profile: ProfileSnapshot): ProfileModel {
  return {
    id: profile.id,
    name: profile.name,
    description: profile.description,
  };
}

export function toLinkModel(link: ProfileLinkRecord): ProfileLinkModel {
  return {
    kind: toLinkKind(link.kind),
    label: link.label,
    url: link.url,
  };
}

export function toSkillModel(skill: SkillRecord): SkillModel {
  return {
    id: skill.id,
    name: skill.name,
    category: toSkillCategory(skill.category),
  };
}

export function toExperienceModel(experience: ExperienceRecord): ExperienceModel {
  return {
    id: experience.id,
    company: experience.company,
    position: experience.position,
    startDate: experience.startDate,
    endDate: experience.endDate,
    isCurrent: isCurrentEmployment(experience.endDate),
  };
}

export function toProjectModel(project: ProjectRecord): ProjectModel {
  return {
    id: project.id,
    name: project.name,
    url: project.url,
    summary: project.summary,
  };
}

function toLinkKind(kind: LinkKind): LinkKindModel {
  switch (kind) {
    case LinkKind.Github:
      return LinkKindModel.GITHUB;
    case LinkKind.Linkedin:
      return LinkKindModel.LINKEDIN;
    case LinkKind.Telegram:
      return LinkKindModel.TELEGRAM;
    case LinkKind.Website:
      return LinkKindModel.WEBSITE;
    case LinkKind.Other:
      return LinkKindModel.OTHER;
    default: {
      const unsupported: never = kind;
      return unsupported;
    }
  }
}

function toSkillCategory(category: SkillCategory): SkillCategoryModel {
  switch (category) {
    case SkillCategory.Language:
      return SkillCategoryModel.LANGUAGE;
    case SkillCategory.Framework:
      return SkillCategoryModel.FRAMEWORK;
    case SkillCategory.Database:
      return SkillCategoryModel.DATABASE;
    case SkillCategory.Platform:
      return SkillCategoryModel.PLATFORM;
    case SkillCategory.Practice:
      return SkillCategoryModel.PRACTICE;
    default: {
      const unsupported: never = category;
      return unsupported;
    }
  }
}
