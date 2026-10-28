export const GRAPHQL_OPERATION_LABELS = [
  'anonymous',
  'Profile',
  'ProfileCard',
  'IntrospectionQuery',
] as const;

export type GraphqlOperationLabel = (typeof GRAPHQL_OPERATION_LABELS)[number] | 'other';

const ALLOWED_OPERATION_LABELS = new Set<string>(GRAPHQL_OPERATION_LABELS);

export function resolveGraphqlOperationLabel(
  operationName: string | null | undefined,
): GraphqlOperationLabel {
  if (!operationName) {
    return 'anonymous';
  }

  if (ALLOWED_OPERATION_LABELS.has(operationName)) {
    return operationName as GraphqlOperationLabel;
  }

  return 'other';
}
