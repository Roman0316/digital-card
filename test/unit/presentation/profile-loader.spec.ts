import { describe, expect, it, vi } from 'vitest';

import type { ProfileRelations } from '../../../src/application/profile/ports/profile-reader.port';
import { ProfileLoaderFactory } from '../../../src/presentation/graphql/profile/profile.loader-factory';

describe('ProfileLoaderFactory', () => {
  it('собирает достижения нескольких ролей одним запросом', async () => {
    const findAchievements = vi.fn<ProfileRelations['findAchievements']>().mockResolvedValue([
      { experienceId: 'exp-1', text: 'Первое', sortOrder: 0 },
      { experienceId: 'exp-2', text: 'Второе', sortOrder: 0 },
    ]);
    const loaders = new ProfileLoaderFactory(relations({ findAchievements })).create();

    const [first, second] = await Promise.all([
      loaders.achievements.load('exp-1'),
      loaders.achievements.load('exp-2'),
    ]);

    expect(first).toEqual(['Первое']);
    expect(second).toEqual(['Второе']);
    expect(findAchievements).toHaveBeenCalledTimes(1);
  });
});

function relations(overrides: Partial<ProfileRelations>): ProfileRelations {
  return {
    findLinks: async () => [],
    findSkills: async () => [],
    findExperience: async () => [],
    findAchievements: async () => [],
    findProjects: async () => [],
    findProjectSkills: async () => [],
    ...overrides,
  };
}
