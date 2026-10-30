import { Inject, Injectable } from '@nestjs/common';

import type { ProfileSnapshot } from '../../domain/profile/interfaces/profile-read-model.interface';
import { ProfileNotFoundError } from '../shared/application-error';

import type { ProfileLookup } from './interfaces/profile-reader.interface';
import { PROFILE_LOOKUP, PROFILE_SLUG } from './tokens';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(PROFILE_LOOKUP) private readonly profiles: ProfileLookup,
    @Inject(PROFILE_SLUG) private readonly slug: string,
  ) {}

  async execute(): Promise<ProfileSnapshot> {
    const profile = await this.profiles.findBySlug(this.slug);
    if (!profile) {
      throw new ProfileNotFoundError();
    }
    return profile;
  }
}
