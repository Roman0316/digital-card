import {
  Injectable,
  type ValidationError,
  type ArgumentMetadata,
  type PipeTransform,
} from '@nestjs/common';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

import { ErrorCode } from '../../../shared/constants/error-codes';

@Injectable()
export class AppValidationPipe extends ValidationPipe implements PipeTransform {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          code: ErrorCode.Validation,
          message: flattenValidationErrors(errors).join('; '),
        }),
    });
  }

  override transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    return super.transform(value, metadata);
  }
}

export function flattenValidationErrors(errors: readonly ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      messages.push(...flattenValidationErrors(error.children));
    }
  }

  return messages.length > 0 ? messages : ['Данные запроса не прошли проверку'];
}
