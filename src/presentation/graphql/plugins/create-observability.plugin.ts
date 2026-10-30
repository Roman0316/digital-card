import type { ApolloServerPlugin } from '@apollo/server';

import type { AppMetrics } from '../../../infrastructure/metrics/app-metrics';
import { resolveGraphqlOperationLabel } from '../../../shared/constants/graphql-operations';
import { REQUEST_ID_HEADER } from '../../../shared/constants/headers';
import type { GraphqlContext } from '../interfaces/graphql-context.interface';

const NANOSECONDS_IN_SECOND = 1_000_000_000;

export function createGraphqlObservabilityPlugin(
  metrics: AppMetrics,
): ApolloServerPlugin<GraphqlContext> {
  return {
    async requestDidStart() {
      const started = process.hrtime.bigint();
      return {
        async willSendResponse(requestContext) {
          const response = requestContext.contextValue.req.res;
          if (response && !response.headersSent) {
            response.setHeader(REQUEST_ID_HEADER, requestContext.contextValue.requestId);
          }

          const operation = resolveGraphqlOperationLabel(requestContext.operationName);
          const failed = (requestContext.errors?.length ?? 0) > 0;
          const result = failed ? 'error' : 'success';
          const seconds = Number(process.hrtime.bigint() - started) / NANOSECONDS_IN_SECOND;
          metrics.graphqlOperations.inc({ operation, result });
          metrics.graphqlDuration.observe({ operation, result }, seconds);
          if (failed) {
            metrics.graphqlErrors.inc({ operation });
          }
        },
      };
    },
  };
}
