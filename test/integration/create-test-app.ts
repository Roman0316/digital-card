import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { DATABASE_HEALTH, EVENT_LOOP_HEALTH } from '../../src/application/probes/tokens';
import { PROFILE_SLUG } from '../../src/application/profile/tokens';
import { configureHttp } from '../../src/presentation/http/configure-http';

import type { TestAppOptions } from './interfaces/test-app-options.interface';

export async function createTestApp(options: TestAppOptions = {}): Promise<INestApplication> {
  const builder = Test.createTestingModule({ imports: [AppModule] });

  if (options.slug) {
    builder.overrideProvider(PROFILE_SLUG).useValue(options.slug);
  }
  if (options.databaseAvailable === false) {
    builder.overrideProvider(DATABASE_HEALTH).useValue({ ping: async () => false });
  }
  if (options.eventLoopHealthy === false) {
    builder.overrideProvider(EVENT_LOOP_HEALTH).useValue({ isHealthy: () => false });
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  configureHttp(app);
  await app.init();
  return app;
}
