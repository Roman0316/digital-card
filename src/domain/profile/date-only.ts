import { DomainError } from '../shared/domain-error';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export class InvalidDateOnlyError extends DomainError {
  readonly code = 'INVALID_DATE';

  constructor(value: string) {
    super(`Дата «${value}» должна быть календарной датой в формате YYYY-MM-DD`);
  }
}

export class DateOnly {
  private constructor(readonly value: string) {}

  static parse(value: string): DateOnly {
    const match = DATE_ONLY_PATTERN.exec(value);
    if (!match) {
      throw new InvalidDateOnlyError(value);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;

    if (!isRealDate) {
      throw new InvalidDateOnlyError(value);
    }

    return new DateOnly(value);
  }

  isBefore(other: DateOnly): boolean {
    return this.value < other.value;
  }

  isAfter(other: DateOnly): boolean {
    return this.value > other.value;
  }
}
