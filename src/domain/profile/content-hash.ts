import { createHash } from 'node:crypto';

export const CATALOG_SCHEMA_VERSION = 1;

export function createContentHash(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
    const result: Record<string, unknown> = {};
    for (const [key, entry] of entries) {
      result[key] = canonicalize(entry);
    }
    return result;
  }

  return value;
}
