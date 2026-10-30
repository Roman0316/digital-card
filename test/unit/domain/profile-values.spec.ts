import { describe, expect, it } from 'vitest';

import { DateOnly, InvalidDateOnlyError } from '../../../src/domain/profile/date-only';
import {
  EmploymentPeriod,
  InvalidEmploymentPeriodError,
} from '../../../src/domain/profile/employment-period';
import {
  InvalidExternalUrlError,
  normalizeExternalUrl,
} from '../../../src/domain/profile/external-url';

describe('DateOnly', () => {
  it('принимает реальную календарную дату', () => {
    expect(DateOnly.parse('2024-02-29').value).toBe('2024-02-29');
  });

  it('отклоняет несуществующий день', () => {
    expect(() => DateOnly.parse('2023-02-29')).toThrow(InvalidDateOnlyError);
  });
});

describe('EmploymentPeriod', () => {
  it('считает роль открытой, если дата окончания не задана', () => {
    expect(EmploymentPeriod.create('2023-03-01', null).isOpen()).toBe(true);
  });

  it('отклоняет окончание раньше начала', () => {
    expect(() => EmploymentPeriod.create('2023-03-01', '2023-02-01')).toThrow(
      InvalidEmploymentPeriodError,
    );
  });
});

describe('normalizeExternalUrl', () => {
  it('оставляет https-ссылку без хэша и лишнего слэша', () => {
    expect(normalizeExternalUrl('https://github.com/Roman0316/')).toBe(
      'https://github.com/Roman0316',
    );
  });

  it('отклоняет ссылку с паролем', () => {
    expect(() => normalizeExternalUrl('https://user:secret@github.com/Roman0316')).toThrow(
      InvalidExternalUrlError,
    );
  });
});
