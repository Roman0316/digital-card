import type { Env } from './env.schema';
import type { GraphqlConfig } from './interfaces/graphql-config.interface';

export function createGraphqlConfig(env: Env): GraphqlConfig {
  return {
    sandboxEnabled: env.GRAPHQL_SANDBOX_ENABLED,
    introspectionEnabled: env.GRAPHQL_INTROSPECTION_ENABLED,
    depthLimit: env.GRAPHQL_DEPTH_LIMIT,
    includeStacktrace: env.NODE_ENV !== 'production',
  };
}
