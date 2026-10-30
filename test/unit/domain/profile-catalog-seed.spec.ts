import { describe, expect, it } from 'vitest';

import { ProfileCatalog } from '../../../src/domain/profile/profile-catalog';
import { profileCatalogDraft } from '../../../src/infrastructure/seed/profile-catalog.data';

describe('каталог из резюме', () => {
  it('проходит доменную валидацию', () => {
    const catalog = ProfileCatalog.create(profileCatalogDraft);

    expect(catalog.slug).toBe('roman-shestakov');
    expect(catalog.snapshot.links.map((link) => link.url)).toEqual([
      'https://github.com/Roman0316',
      'https://t.me/roman123qwerty',
    ]);
    expect(catalog.snapshot.experience.map((item) => item.company)).toEqual([
      'AT Systems',
      'НИЦ супер-ЭВМ и нейрокомпьютеров',
    ]);
    expect(catalog.snapshot.experience.every((item) => item.endDate !== null)).toBe(true);
  });
});
