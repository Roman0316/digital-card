import { DomainError } from '../shared/domain-error';

import { PROFILE_LIMITS } from './limits';

export class InvalidExternalUrlError extends DomainError {
  readonly code = 'INVALID_URL';

  constructor(message: string) {
    super(message);
  }
}

export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > PROFILE_LIMITS.urlMaxLength) {
    throw new InvalidExternalUrlError(
      'Ссылка должна быть непустой https-ссылкой ограниченной длины',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new InvalidExternalUrlError(`Ссылка «${trimmed}» не разбирается как URL`);
  }

  if (parsed.protocol !== 'https:') {
    throw new InvalidExternalUrlError('Ссылка должна использовать https');
  }

  if (parsed.username.length > 0 || parsed.password.length > 0) {
    throw new InvalidExternalUrlError('Ссылка не должна содержать учётные данные');
  }

  parsed.hash = '';
  let href = parsed.href;
  if (href.endsWith('/') && parsed.pathname !== '/') {
    href = href.slice(0, -1);
  }

  if (href.length > PROFILE_LIMITS.urlMaxLength) {
    throw new InvalidExternalUrlError('Ссылка длиннее допустимого размера');
  }

  return href;
}
