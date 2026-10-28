import { REQUEST_ID_PATTERN } from '../constants/headers';

export function resolveRequestId(
  header: string | readonly string[] | undefined,
  generate: () => string,
): string {
  const candidate = Array.isArray(header) ? (header.length === 1 ? header[0] : undefined) : header;
  const normalized = candidate?.trim();

  if (normalized && REQUEST_ID_PATTERN.test(normalized)) {
    return normalized;
  }

  return generate();
}
