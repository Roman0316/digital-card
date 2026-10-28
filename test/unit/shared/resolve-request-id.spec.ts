import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';

import { resolveRequestId } from '../../../src/shared/request-id/resolve-request-id';

describe('resolveRequestId', () => {
  it('оставляет корректный заголовок', () => {
    const requestId = uuidv4();
    expect(resolveRequestId(requestId, () => 'generated')).toBe(requestId);
  });

  it('генерирует новый идентификатор, если заголовок пустой или опасный', () => {
    expect(resolveRequestId(undefined, () => 'generated')).toBe('generated');
    expect(resolveRequestId('bad id', () => 'generated')).toBe('generated');
    expect(resolveRequestId(['one', 'two'], () => 'generated')).toBe('generated');
  });
});
