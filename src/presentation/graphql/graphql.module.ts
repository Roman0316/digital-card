import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ClsService } from 'nestjs-cls';

import { PROFILE_RELATIONS } from '../../application/profile/tokens';
import type { GraphqlConfig } from '../../config/graphql.config';
import { GRAPHQL_CONFIG } from '../../config/tokens';
import { AppMetrics } from '../../infrastructure/metrics/app-metrics';
import { PrismaProfileReader } from '../../infrastructure/persistence/prisma/prisma-profile.reader';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { ProfileModule } from '../../profile.module';

import type { GraphqlContext } from './graphql-context';
import { createGraphqlObservabilityPlugin } from './plugins/create-observability.plugin';
import { formatGraphqlError } from './plugins/format-graphql-error';
import { ProfileLoaderFactory } from './profile/profile.loader-factory';
import { ExperienceResolver, ProfileResolver, ProjectResolver } from './profile/profile.resolver';
import { DateScalar } from './scalars/date.scalar';
import { createDepthLimitRule } from './validation/depth-limit.rule';

@Module({
  imports: [PrismaModule, ProfileModule],
  providers: [
    ProfileLoaderFactory,
    { provide: PROFILE_RELATIONS, useExisting: PrismaProfileReader },
  ],
  exports: [ProfileLoaderFactory],
})
class ProfileLoaderModule {}

@Module({
  imports: [
    ProfileModule,
    ProfileLoaderModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ProfileLoaderModule],
      inject: [GRAPHQL_CONFIG, ClsService, AppMetrics, ProfileLoaderFactory],
      useFactory: (
        config: GraphqlConfig,
        cls: ClsService,
        metrics: AppMetrics,
        loaders: ProfileLoaderFactory,
      ) => ({
        path: '/graphql',
        autoSchemaFile: true,
        sortSchema: true,
        playground: false,
        introspection: config.introspectionEnabled,
        includeStacktraceInErrorResponses: config.includeStacktrace,
        csrfPrevention: false,
        plugins: [
          ...(config.sandboxEnabled
            ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
            : []),
          createGraphqlObservabilityPlugin(metrics),
        ],
        validationRules: [createDepthLimitRule(config.depthLimit)],
        context: ({ req }: { req: GraphqlContext['req'] }): GraphqlContext => ({
          req,
          requestId: cls.getId(),
          loaders: loaders.create(),
        }),
        formatError: (formatted, error) => formatGraphqlError(formatted, error, readRequestId(cls)),
      }),
    }),
  ],
  providers: [ProfileResolver, ExperienceResolver, ProjectResolver, DateScalar],
})
export class GraphqlApiModule {}

function readRequestId(cls: ClsService): string {
  try {
    return cls.getId();
  } catch {
    return 'unavailable';
  }
}
