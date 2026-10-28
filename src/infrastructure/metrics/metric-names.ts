export const MetricName = {
  HttpRequests: 'card_http_server_requests_total',
  HttpDuration: 'card_http_server_request_duration_seconds',
  HttpErrors: 'card_http_server_errors_total',
  GraphqlOperations: 'card_graphql_operations_total',
  GraphqlDuration: 'card_graphql_operation_duration_seconds',
  GraphqlErrors: 'card_graphql_errors_total',
  CatalogSync: 'card_profile_catalog_sync_total',
} as const;

export const HTTP_DURATION_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5] as const;
