import { DomainError } from '../shared/domain-error';

import { DateOnly } from './date-only';

export class InvalidEmploymentPeriodError extends DomainError {
  readonly code = 'INVALID_EMPLOYMENT_PERIOD';

  constructor() {
    super('Дата окончания работы не может быть раньше даты начала');
  }
}

export class EmploymentPeriod {
  private constructor(
    readonly start: DateOnly,
    readonly end: DateOnly | null,
  ) {}

  static create(start: string, end: string | null): EmploymentPeriod {
    const startDate = DateOnly.parse(start);
    const endDate = end === null ? null : DateOnly.parse(end);

    if (endDate && endDate.isBefore(startDate)) {
      throw new InvalidEmploymentPeriodError();
    }

    return new EmploymentPeriod(startDate, endDate);
  }

  isOpen(): boolean {
    return this.end === null;
  }
}

export function isCurrentEmployment(endDate: string | null): boolean {
  return endDate === null;
}
