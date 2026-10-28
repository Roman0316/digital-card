import { GraphQLError, type GraphQLFormattedError } from 'graphql';

import { ProfileNotFoundError } from '../../../application/shared/application-error';
import { ErrorCode } from '../../../shared/constants/error-codes';

const PUBLIC_CODES = new Set<string>([
  ErrorCode.ProfileNotFound,
  'GRAPHQL_VALIDATION_FAILED',
  'GRAPHQL_PARSE_FAILED',
  'BAD_USER_INPUT',
  'BAD_REQUEST',
]);

export function formatGraphqlError(
  formatted: GraphQLFormattedError,
  error: unknown,
  requestId: string,
): GraphQLFormattedError {
  const original = unwrap(error);
  const code =
    original instanceof ProfileNotFoundError ? original.code : readFormattedCode(formatted);

  return {
    message: publicMessage(code, original, formatted),
    locations: formatted.locations,
    path: formatted.path,
    extensions: { code, requestId },
  };
}

function publicMessage(code: string, original: unknown, formatted: GraphQLFormattedError): string {
  if (original instanceof ProfileNotFoundError) {
    return original.message;
  }
  if (PUBLIC_CODES.has(code)) {
    return formatted.message;
  }
  return 'Внутренняя ошибка сервера';
}

function readFormattedCode(formatted: GraphQLFormattedError): string {
  const code = formatted.extensions?.code;
  return typeof code === 'string' ? code : ErrorCode.Internal;
}

function unwrap(error: unknown): unknown {
  if (error instanceof GraphQLError && error.originalError) {
    return unwrap(error.originalError);
  }
  if (typeof error === 'object' && error !== null && 'originalError' in error) {
    const original = error.originalError;
    if (original) {
      return unwrap(original);
    }
  }
  return error;
}
