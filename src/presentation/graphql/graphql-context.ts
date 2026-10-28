import type { Request } from 'express';

import type { ProfileLoaders } from './profile/profile.loader-factory';

export interface GraphqlContext {
  req: Request;
  requestId: string;
  loaders: ProfileLoaders;
}
