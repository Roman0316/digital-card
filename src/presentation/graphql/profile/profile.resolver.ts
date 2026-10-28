import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GetProfileUseCase } from '../../../application/profile/get-profile.use-case';
import type { GraphqlContext } from '../graphql-context';

import { toProfileModel } from './profile.mapper';
import {
  ExperienceModel,
  ProfileLinkModel,
  ProfileModel,
  ProjectModel,
  SkillModel,
} from './profile.models';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly getProfile: GetProfileUseCase) {}

  @Query(() => ProfileModel, {
    name: 'profile',
    description: 'Профиль специалиста и связанные с ним данные',
  })
  async profile(): Promise<ProfileModel> {
    return toProfileModel(await this.getProfile.execute());
  }

  @ResolveField(() => [ProfileLinkModel], { description: 'Профессиональные ссылки' })
  links(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<ProfileLinkModel[]> {
    return context.loaders.links.load(profile.id);
  }

  @ResolveField(() => [SkillModel], { description: 'Навыки' })
  skills(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<SkillModel[]> {
    return context.loaders.skills.load(profile.id);
  }

  @ResolveField(() => [ExperienceModel], { description: 'Опыт работы' })
  experience(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<ExperienceModel[]> {
    return context.loaders.experience.load(profile.id);
  }

  @ResolveField(() => [ProjectModel], { description: 'Проекты' })
  projects(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<ProjectModel[]> {
    return context.loaders.projects.load(profile.id);
  }
}

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  @ResolveField(() => [String], { description: 'Достижения на этой роли' })
  achievements(
    @Parent() experience: ExperienceModel,
    @Context() context: GraphqlContext,
  ): Promise<string[]> {
    return context.loaders.achievements.load(experience.id);
  }
}

@Resolver(() => ProjectModel)
export class ProjectResolver {
  @ResolveField(() => [SkillModel], { description: 'Навыки, на которые опирается проект' })
  skills(
    @Parent() project: ProjectModel,
    @Context() context: GraphqlContext,
  ): Promise<SkillModel[]> {
    return context.loaders.projectSkills.load(project.id);
  }
}
