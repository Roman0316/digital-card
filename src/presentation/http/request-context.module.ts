import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

import { REQUEST_ID_HEADER } from '../../shared/constants/headers';
import { resolveRequestId } from '../../shared/request-id/resolve-request-id';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (request: { headers: Record<string, unknown> }) => {
          const header = request.headers[REQUEST_ID_HEADER];
          const value = typeof header === 'string' || Array.isArray(header) ? header : undefined;
          return resolveRequestId(normalizeHeader(value), () => uuidv4());
        },
      },
    }),
  ],
})
export class RequestContextModule {}

function normalizeHeader(
  value: string | unknown[] | undefined,
): string | readonly string[] | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const headers = value.filter((item): item is string => typeof item === 'string');
  return headers.length === value.length ? headers : undefined;
}
