import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, type ValueNode } from 'graphql';

import { DateOnly, InvalidDateOnlyError } from '../../../domain/profile/date-only';

export class DateOnlyGraphql {}

@Scalar('DateOnly', () => DateOnlyGraphql)
export class DateOnlyScalar implements CustomScalar<string, string> {
  description = 'Календарная дата в формате YYYY-MM-DD';

  parseValue(value: unknown): string {
    return parseDate(value);
  }

  serialize(value: unknown): string {
    return parseDate(value);
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind !== Kind.STRING) {
      throw new InvalidDateOnlyError('не строка');
    }
    return parseDate(ast.value);
  }
}

function parseDate(value: unknown): string {
  if (typeof value !== 'string') {
    throw new InvalidDateOnlyError(String(value));
  }
  return DateOnly.parse(value).value;
}
