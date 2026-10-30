import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces } from '@nestjs/swagger';

export function ApiMetrics(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Метрики Prometheus' }),
    ApiProduces('text/plain'),
    ApiOkResponse({ description: 'Текстовый формат Prometheus', schema: { type: 'string' } }),
  );
}
