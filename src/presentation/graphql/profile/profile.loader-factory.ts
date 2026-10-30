import { Inject, Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';

import type { ProfileRelations } from '../../../application/profile/interfaces/profile-reader.interface';
import { PROFILE_RELATIONS } from '../../../application/profile/tokens';
import { alignByKey, groupBy } from '../../../shared/collection/group-by';
import type { ProfileLoaders } from '../interfaces/profile-loaders.interface';

import { toExperienceModel, toLinkModel, toProjectModel, toSkillModel } from './profile.mapper';

@Injectable()
export class ProfileLoaderFactory {
  constructor(@Inject(PROFILE_RELATIONS) private readonly relations: ProfileRelations) {}

  create(): ProfileLoaders {
    return {
      links: new DataLoader(async (profileIds) => {
        const rows = await this.relations.findLinks(profileIds);
        const grouped = groupBy(rows, (row) => row.profileId);
        return alignByKey(profileIds, grouped, []).map((links) => links.map(toLinkModel));
      }),
      skills: new DataLoader(async (profileIds) => {
        const rows = await this.relations.findSkills(profileIds);
        const grouped = groupBy(rows, (row) => row.profileId);
        return alignByKey(profileIds, grouped, []).map((skills) => skills.map(toSkillModel));
      }),
      experience: new DataLoader(async (profileIds) => {
        const rows = await this.relations.findExperience(profileIds);
        const grouped = groupBy(rows, (row) => row.profileId);
        return alignByKey(profileIds, grouped, []).map((items) => items.map(toExperienceModel));
      }),
      achievements: new DataLoader(async (experienceIds) => {
        const rows = await this.relations.findAchievements(experienceIds);
        const grouped = groupBy(rows, (row) => row.experienceId);
        return alignByKey(experienceIds, grouped, []).map((items) =>
          [...items]
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((item) => item.text),
        );
      }),
      projects: new DataLoader(async (profileIds) => {
        const rows = await this.relations.findProjects(profileIds);
        const grouped = groupBy(rows, (row) => row.profileId);
        return alignByKey(profileIds, grouped, []).map((projects) => projects.map(toProjectModel));
      }),
      projectSkills: new DataLoader(async (projectIds) => {
        const rows = await this.relations.findProjectSkills(projectIds);
        const grouped = groupBy(rows, (row) => row.projectId);
        return alignByKey(projectIds, grouped, []).map((links) =>
          links.map((link) => toSkillModel(link.skill)),
        );
      }),
    };
  }
}
