import type {
  CatalogSyncContext,
  StoredCatalogHead,
} from '../../../application/profile/ports/catalog-sync.port';
import { CatalogSyncConflictError } from '../../../application/shared/application-error';
import type { ProfileCatalog } from '../../../domain/profile/profile-catalog';

import { asCatalogConflict } from './prisma-error.mapper';
import type { DbClient } from './prisma.service';

export class PrismaCatalogSyncContext implements CatalogSyncContext {
  constructor(private readonly db: DbClient) {}

  async acquireLock(key: bigint): Promise<void> {
    const high = Number((key >> 32n) & 0x7fffffffn);
    const low = Number(key & 0x7fffffffn);
    await this.db.$executeRaw`SELECT pg_advisory_xact_lock(${high}, ${low})`;
  }

  async findHead(slug: string): Promise<StoredCatalogHead | null> {
    const head = await this.db.profile.findUnique({
      where: { slug },
      select: { contentHash: true, version: true },
    });

    if (!head) {
      return null;
    }

    return { contentHash: head.contentHash, version: head.version };
  }

  async replace(
    catalog: ProfileCatalog,
    contentHash: string,
    expectedVersion: number | null,
  ): Promise<void> {
    try {
      const profileId = await this.writeProfile(catalog, contentHash, expectedVersion);
      await this.deleteChildren(profileId);
      await this.insertChildren(profileId, catalog);
    } catch (error) {
      const conflict = asCatalogConflict(error);
      if (conflict) {
        throw conflict;
      }
      throw error;
    }
  }

  private async writeProfile(
    catalog: ProfileCatalog,
    contentHash: string,
    expectedVersion: number | null,
  ): Promise<string> {
    const snapshot = catalog.snapshot;

    if (expectedVersion === null) {
      const created = await this.db.profile.create({
        data: {
          slug: snapshot.slug,
          name: snapshot.name,
          description: snapshot.description,
          contentHash,
        },
        select: { id: true },
      });
      return created.id;
    }

    const updated = await this.db.profile.updateMany({
      where: { slug: snapshot.slug, version: expectedVersion },
      data: {
        name: snapshot.name,
        description: snapshot.description,
        contentHash,
        version: { increment: 1 },
      },
    });

    if (updated.count !== 1) {
      throw new CatalogSyncConflictError();
    }

    const profile = await this.db.profile.findUnique({
      where: { slug: snapshot.slug },
      select: { id: true },
    });

    if (!profile) {
      throw new CatalogSyncConflictError();
    }

    return profile.id;
  }

  private async deleteChildren(profileId: string): Promise<void> {
    await this.db.project.deleteMany({ where: { profileId } });
    await this.db.experience.deleteMany({ where: { profileId } });
    await this.db.skill.deleteMany({ where: { profileId } });
    await this.db.profileLink.deleteMany({ where: { profileId } });
  }

  private async insertChildren(profileId: string, catalog: ProfileCatalog): Promise<void> {
    const snapshot = catalog.snapshot;

    await this.db.profileLink.createMany({
      data: snapshot.links.map((link) => ({
        profileId,
        kind: link.kind,
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
      })),
    });

    await this.db.skill.createMany({
      data: snapshot.skills.map((skill) => ({
        profileId,
        name: skill.name,
        category: skill.category,
        sortOrder: skill.sortOrder,
      })),
    });

    const skills = await this.db.skill.findMany({
      where: { profileId },
      select: { id: true, name: true },
    });
    const skillIdByName = new Map(skills.map((skill) => [skill.name, skill.id]));

    for (const experience of snapshot.experience) {
      await this.db.experience.create({
        data: {
          profileId,
          company: experience.company,
          position: experience.position,
          startDate: experience.startDate,
          endDate: experience.endDate,
          sortOrder: experience.sortOrder,
          achievements: {
            create: experience.achievements.map((achievement) => ({
              text: achievement.text,
              sortOrder: achievement.sortOrder,
            })),
          },
        },
      });
    }

    for (const project of snapshot.projects) {
      const created = await this.db.project.create({
        data: {
          profileId,
          name: project.name,
          url: project.url,
          summary: project.summary,
          sortOrder: project.sortOrder,
        },
        select: { id: true },
      });

      if (project.skillNames.length === 0) {
        continue;
      }

      await this.db.projectSkill.createMany({
        data: project.skillNames.map((skillName) => {
          const skillId = skillIdByName.get(skillName);
          if (!skillId) {
            throw new Error(`Навык «${skillName}» не найден после записи каталога`);
          }
          return { projectId: created.id, skillId };
        }),
      });
    }
  }
}
