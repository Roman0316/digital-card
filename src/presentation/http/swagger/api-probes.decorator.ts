import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ErrorResponseDto, ProbeResponseDto } from '../dto/http-response.dto';

export function ApiLiveness(): MethodDecorator {
  return applyDecorators(
    ApiTags('probes'),
    ApiOperation({ summary: 'Liveness probe', description: 'Процесс жив и event loop не застрял' }),
    ApiOkResponse({ type: ProbeResponseDto }),
    ApiServiceUnavailableResponse({ type: ErrorResponseDto }),
  );
}

export function ApiReadiness(): MethodDecorator {
  return applyDecorators(
    ApiTags('probes'),
    ApiOperation({
      summary: 'Readiness probe',
      description: 'Каталог применён и база данных отвечает',
    }),
    ApiOkResponse({ type: ProbeResponseDto }),
    ApiServiceUnavailableResponse({ type: ErrorResponseDto }),
  );
}
