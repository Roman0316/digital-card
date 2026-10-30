import { describe, expect, it } from 'vitest';

import { ProfileCatalog } from '../../../src/domain/profile/profile-catalog';
import { hashPersistedCatalog } from '../../../src/infrastructure/persistence/prisma/map-persisted-catalog';
import { profileCatalogDraft } from '../../../src/infrastructure/seed/profile-catalog.data';

describe('hashPersistedCatalog', () => {
  it('совпадает с хешем доменного каталога', () => {
    const catalog = ProfileCatalog.create(profileCatalogDraft);
    const snapshot = catalog.snapshot;

    expect(
      hashPersistedCatalog({
        slug: snapshot.slug,
        name: snapshot.name,
        description: snapshot.description,
        links: snapshot.links,
        skills: snapshot.skills,
        experiences: snapshot.experience,
        projects: snapshot.projects.map((project) => ({
          name: project.name,
          url: project.url,
          summary: project.summary,
          sortOrder: project.sortOrder,
          skills: project.skillNames.map((name) => ({ skill: { name } })),
        })),
      }),
    ).toBe(catalog.contentHash);
  });
});
