import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import type { Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import { ErrorCode } from '../../../shared/constants/error-codes';
import { REQUEST_ID_HEADER } from '../../../shared/constants/headers';
import type { ErrorResponseBody } from '../interfaces/error-response-body.interface';

@Injectable()
@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly cls: ClsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ApplicationExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType<string>() === 'graphql') {
      const graphql = GqlArgumentsHost.create(host);
      const request = graphql.getContext<{ req?: { res?: Response } }>().req;
      this.writeRequestId(request?.res);
      throw exception;
    }

    const response = host.switchToHttp().getResponse<Response>();
    const requestId = this.readRequestId();
    const body = this.toBody(exception, requestId);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ err: exception, requestId }, 'Request failed');
    }

    this.writeRequestId(response, requestId);
    if (!response.headersSent) {
      response.status(body.statusCode).json(body);
    }
  }

  private toBody(exception: unknown, requestId: string): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const details = readHttpException(exception);
      return {
        statusCode: details.statusCode,
        code: details.code,
        message: details.message,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.Internal,
      message: 'Внутренняя ошибка сервера',
      requestId,
      timestamp: new Date().toISOString(),
    };
  }

  private readRequestId(): string {
    try {
      return this.cls.getId();
    } catch {
      return 'unavailable';
    }
  }

  private writeRequestId(response: Response | undefined, requestId = this.readRequestId()): void {
    if (response && !response.headersSent) {
      response.setHeader(REQUEST_ID_HEADER, requestId);
    }
  }
}

function readHttpException(exception: HttpException): {
  statusCode: number;
  code: string;
  message: string;
} {
  const statusCode = exception.getStatus();
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return { statusCode, code: codeFromStatus(statusCode), message: response };
  }

  if (typeof response === 'object' && response !== null) {
    const body = response as { message?: unknown; code?: unknown };
    const message = Array.isArray(body.message)
      ? body.message.filter((item): item is string => typeof item === 'string').join('; ')
      : typeof body.message === 'string'
        ? body.message
        : exception.message;
    const code = typeof body.code === 'string' ? body.code : codeFromStatus(statusCode);
    return { statusCode, code, message };
  }

  return { statusCode, code: codeFromStatus(statusCode), message: exception.message };
}

function codeFromStatus(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.BadRequest;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NotFound;
    case HttpStatus.CONFLICT:
      return ErrorCode.Conflict;
    case HttpStatus.SERVICE_UNAVAILABLE:
      return ErrorCode.NotReady;
    default:
      return statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
        ? ErrorCode.Internal
        : ErrorCode.BadRequest;
  }
}
