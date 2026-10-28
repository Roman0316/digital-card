import { Global, Module } from '@nestjs/common';

import { createAppConfig } from './app.config';
import { createDatabaseConfig } from './database.config';
import type { Env } from './env.schema';
import { createGraphqlConfig } from './graphql.config';
import { loadEnv } from './load-env';
import { createLoggerConfig } from './logger.config';
import { createProbesConfig } from './probes.config';
import { createRuntimeEnvironment, createWorkingDirectory } from './runtime-environment';
import {
  APP_CONFIG,
  DATABASE_CONFIG,
  ENV,
  GRAPHQL_CONFIG,
  LOGGER_CONFIG,
  PROBES_CONFIG,
  RUNTIME_ENVIRONMENT,
  WORKING_DIRECTORY,
} from './tokens';

@Global()
@Module({
  providers: [
    { provide: ENV, useFactory: (): Env => loadEnv() },
    { provide: APP_CONFIG, useFactory: createAppConfig, inject: [ENV] },
    { provide: DATABASE_CONFIG, useFactory: createDatabaseConfig, inject: [ENV] },
    { provide: LOGGER_CONFIG, useFactory: createLoggerConfig, inject: [ENV] },
    { provide: GRAPHQL_CONFIG, useFactory: createGraphqlConfig, inject: [ENV] },
    { provide: PROBES_CONFIG, useFactory: createProbesConfig, inject: [ENV] },
    { provide: RUNTIME_ENVIRONMENT, useFactory: createRuntimeEnvironment },
    { provide: WORKING_DIRECTORY, useFactory: createWorkingDirectory },
  ],
  exports: [
    ENV,
    APP_CONFIG,
    DATABASE_CONFIG,
    LOGGER_CONFIG,
    GRAPHQL_CONFIG,
    PROBES_CONFIG,
    RUNTIME_ENVIRONMENT,
    WORKING_DIRECTORY,
  ],
})
export class AppConfigModule {}
