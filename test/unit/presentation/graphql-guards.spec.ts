import { buildSchema, parse, validate } from 'graphql';
import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';

import { ProfileNotFoundError } from '../../../src/application/shared/application-error';
import { CatalogSyncConflictError } from '../../../src/application/shared/application-error';
import { asCatalogConflict } from '../../../src/infrastructure/persistence/prisma/prisma-error.mapper';
import { formatGraphqlError } from '../../../src/presentation/graphql/plugins/format-graphql-error';
import { createDepthLimitRule } from '../../../src/presentation/graphql/validation/depth-limit.rule';

const schema = buildSchema(`
  type Query { profile: Profile }
  type Profile { skills: [Skill] }
  type Skill { name: String }
`);

describe('ограничение глубины GraphQL', () => {
  it('пропускает запрос в пределах лимита и отклоняет более глубокий', () => {
    const document = parse('query { profile { skills { name } } }');

    expect(validate(schema, document, [createDepthLimitRule(3)])).toHaveLength(0);
    expect(validate(schema, document, [createDepthLimitRule(2)]).length).toBeGreaterThan(0);
  });

  it('не мешает introspection', () => {
    const errors = validate(schema, parse('query { __schema { types { name } } }'), [
      createDepthLimitRule(1),
    ]);
    expect(errors).toHaveLength(0);
  });
});

describe('формат ошибок GraphQL', () => {
  it('оставляет код отсутствующего профиля и прячет внутреннюю ошибку', () => {
    const requestId = 'request-1';
    const notFound = formatGraphqlError(
      { message: 'wrapped' },
      new GraphQLError('wrapped', { originalError: new ProfileNotFoundError() }),
      requestId,
    );
    const internal = formatGraphqlError({ message: 'secret' }, new Error('secret'), requestId);

    expect(notFound.extensions).toMatchObject({ code: 'PROFILE_NOT_FOUND', requestId });
    expect(notFound.message).toBe('Профиль не найден');
    expect(internal.message).toBe('Внутренняя ошибка сервера');
    expect(internal.extensions).toMatchObject({ code: 'INTERNAL_ERROR', requestId });
  });
});

describe('ошибки Prisma', () => {
  it('превращает уникальное ограничение в конфликт каталога', () => {
    expect(asCatalogConflict({ code: 'P2002' })).toBeInstanceOf(CatalogSyncConflictError);
    expect(asCatalogConflict(new Error('network'))).toBeNull();
  });
});
