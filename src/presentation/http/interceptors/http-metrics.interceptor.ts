import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AppMetrics } from '../../../infrastructure/metrics/app-metrics';

const NANOSECONDS_IN_SECOND = 1_000_000_000;

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: AppMetrics) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const started = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        this.observe(request, response.statusCode, started);
      }),
      catchError((error: unknown) => {
        const status = error instanceof HttpException ? error.getStatus() : 500;
        this.observe(request, status, started);
        return throwError(() => error);
      }),
    );
  }

  private observe(request: Request, status: number, started: bigint): void {
    const labels = {
      method: request.method,
      route: resolveRoute(request),
      status: String(status),
    };
    const seconds = Number(process.hrtime.bigint() - started) / NANOSECONDS_IN_SECOND;
    this.metrics.httpRequests.inc(labels);
    this.metrics.httpDuration.observe(labels, seconds);
    if (status >= 500) {
      this.metrics.httpErrors.inc(labels);
    }
  }
}

function resolveRoute(request: Request): string {
  const route = request.route as { path?: unknown } | undefined;
  if (route && typeof route.path === 'string') {
    return `${request.baseUrl}${route.path}`;
  }
  if (request.path === '/graphql') {
    return '/graphql';
  }
  return 'unmatched';
}
