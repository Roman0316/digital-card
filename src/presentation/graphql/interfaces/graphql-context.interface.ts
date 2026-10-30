import type { Request, Response } from 'express';

import type { ProfileLoaders } from './profile-loaders.interface';

export interface GraphqlContext {
  req: Request & { res?: Response };
  requestId: string;
  loaders: ProfileLoaders;
}
