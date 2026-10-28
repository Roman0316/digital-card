import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

import { REQUEST_ID_HEADER } from '../../../shared/constants/headers';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = readResponse(context);
    if (response && !response.headersSent) {
      response.setHeader(REQUEST_ID_HEADER, this.cls.getId());
    }
    return next.handle();
  }
}

function readResponse(context: ExecutionContext): Response | null {
  const type = context.getType<string>();

  if (type === 'http') {
    return context.switchToHttp().getResponse<Response>();
  }

  if (type === 'graphql') {
    const graphql = GqlExecutionContext.create(context);
    const request = graphql.getContext<{ req?: { res?: Response } }>().req;
    return request?.res ?? null;
  }

  return null;
}
