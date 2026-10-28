import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';

export function ApiMetrics(): MethodDecorator {
  return applyDecorators(
    ApiTags('metrics'),
    ApiOperation({ summary: 'Метрики Prometheus' }),
    ApiProduces('text/plain'),
    ApiOkResponse({ description: 'Текстовый формат Prometheus', schema: { type: 'string' } }),
  );
}
