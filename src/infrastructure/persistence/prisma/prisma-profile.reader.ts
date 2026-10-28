import { Injectable } from '@nestjs/common';

import type {
  ProfileLookup,
  ProfileRelations,
} from '../../../application/profile/ports/profile-reader.port';
import { isLinkKind } from '../../../domain/profile/link-kind';
import type {
  AchievementRecord,
  ExperienceRecord,
  ProfileLinkRecord,
  ProfileSnapshot,
  ProjectRecord,
  ProjectSkillRecord,
  SkillRecord,
} from '../../../domain/profile/profile-read-model';
import { isSkillCategory } from '../../../domain/profile/skill-category';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaProfileReader implements ProfileLookup, ProfileRelations {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<ProfileSnapshot | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, description: true },
    });

    return profile;
  }

  async findLinks(profileIds: readonly string[]): Promise<readonly ProfileLinkRecord[]> {
    const rows = await this.prisma.profileLink.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => ({
      profileId: row.profileId,
      kind: requireLinkKind(row.kind),
      label: row.label,
      url: row.url,
      sortOrder: row.sortOrder,
    }));
  }

  async findSkills(profileIds: readonly string[]): Promise<readonly SkillRecord[]> {
    const rows = await this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      name: row.name,
      category: requireSkillCategory(row.category),
      sortOrder: row.sortOrder,
    }));
  }

  async findExperience(profileIds: readonly string[]): Promise<readonly ExperienceRecord[]> {
    const rows = await this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ startDate: 'desc' }, { sortOrder: 'asc' }],
    });

    return rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      company: row.company,
      position: row.position,
      startDate: row.startDate,
      endDate: row.endDate,
      sortOrder: row.sortOrder,
    }));
  }

  async findAchievements(experienceIds: readonly string[]): Promise<readonly AchievementRecord[]> {
    const rows = await this.prisma.achievement.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => ({
      experienceId: row.experienceId,
      text: row.text,
      sortOrder: row.sortOrder,
    }));
  }

  async findProjects(profileIds: readonly string[]): Promise<readonly ProjectRecord[]> {
    const rows = await this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      name: row.name,
      url: row.url,
      summary: row.summary,
      sortOrder: row.sortOrder,
    }));
  }

  async findProjectSkills(projectIds: readonly string[]): Promise<readonly ProjectSkillRecord[]> {
    const rows = await this.prisma.projectSkill.findMany({
      where: { projectId: { in: [...projectIds] } },
      include: { skill: true },
      orderBy: { skill: { sortOrder: 'asc' } },
    });

    return rows.map((row) => ({
      projectId: row.projectId,
      skill: {
        id: row.skill.id,
        profileId: row.skill.profileId,
        name: row.skill.name,
        category: requireSkillCategory(row.skill.category),
        sortOrder: row.skill.sortOrder,
      },
    }));
  }
}

function requireLinkKind(value: string): ProfileLinkRecord['kind'] {
  if (!isLinkKind(value)) {
    throw new Error(`Неизвестный тип ссылки в базе: ${value}`);
  }
  return value;
}

function requireSkillCategory(value: string): SkillRecord['category'] {
  if (!isSkillCategory(value)) {
    throw new Error(`Неизвестная категория навыка в базе: ${value}`);
  }
  return value;
}
