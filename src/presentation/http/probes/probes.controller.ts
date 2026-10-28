import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { CheckLivenessUseCase } from '../../../application/probes/check-liveness.use-case';
import { CheckReadinessUseCase } from '../../../application/probes/check-readiness.use-case';
import { ErrorCode } from '../../../shared/constants/error-codes';
import { RoutePath } from '../../../shared/constants/routes';
import { RequestId } from '../decorators/request-id.decorator';
import type { ProbeResponseDto } from '../dto/http-response.dto';
import { ApiLiveness, ApiReadiness } from '../swagger/api-probes.decorator';

@Controller()
export class ProbesController {
  constructor(
    private readonly liveness: CheckLivenessUseCase,
    private readonly readiness: CheckReadinessUseCase,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProbesController.name);
  }

  @Get(RoutePath.Live)
  @ApiLiveness()
  live(@RequestId() requestId: string): ProbeResponseDto {
    const result = this.liveness.execute();
    if (!result.ok) {
      this.logger.warn({ requestId, reason: result.reason }, 'Liveness probe failed');
      throw new ServiceUnavailableException({
        code: ErrorCode.NotLive,
        message: 'Процесс не может обслуживать запросы',
      });
    }
    return { status: 'ok' };
  }

  @Get(RoutePath.Ready)
  @ApiReadiness()
  async ready(@RequestId() requestId: string): Promise<ProbeResponseDto> {
    const result = await this.readiness.execute();
    if (!result.ok) {
      this.logger.warn({ requestId, reason: result.reason }, 'Readiness probe failed');
      throw new ServiceUnavailableException({
        code: ErrorCode.NotReady,
        message: 'Приложение не готово принимать трафик',
      });
    }
    return { status: 'ok' };
  }
}
