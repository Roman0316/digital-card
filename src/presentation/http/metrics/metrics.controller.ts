import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AppMetrics } from '../../../infrastructure/metrics/app-metrics';
import { RoutePath } from '../../../shared/constants/routes';
import { ApiMetrics } from '../swagger/api-metrics.decorator';

@ApiTags('metrics')
@Controller()
export class MetricsController {
  constructor(private readonly appMetrics: AppMetrics) {}

  @Get(RoutePath.Metrics)
  @ApiMetrics()
  async metrics(@Res({ passthrough: true }) response: Response): Promise<string> {
    response.type(this.appMetrics.contentType);
    return this.appMetrics.scrape();
  }
}
