import { CatalogSyncConflictError } from '../../../application/shared/application-error';

const UNIQUE_VIOLATION = 'P2002';

export function isUniqueViolation(error: unknown): boolean {
  return readPrismaCode(error) === UNIQUE_VIOLATION;
}

export function asCatalogConflict(error: unknown): CatalogSyncConflictError | null {
  if (error instanceof CatalogSyncConflictError || isUniqueViolation(error)) {
    return new CatalogSyncConflictError();
  }
  return null;
}

function readPrismaCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }
  const code = error.code;
  return typeof code === 'string' ? code : null;
}
