import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { CheckLivenessUseCase } from '../../application/probes/check-liveness.use-case';
import { CheckReadinessUseCase } from '../../application/probes/check-readiness.use-case';
import { DATABASE_HEALTH } from '../../application/probes/tokens';
import { PrismaDatabaseHealth } from '../../infrastructure/persistence/prisma/prisma-database-health';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';

import { ApplicationExceptionFilter } from './filters/application-exception.filter';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { MetricsController } from './metrics/metrics.controller';
import { AppValidationPipe } from './pipes/app-validation.pipe';
import { ProbesController } from './probes/probes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProbesController, MetricsController],
  providers: [
    CheckReadinessUseCase,
    CheckLivenessUseCase,
    { provide: DATABASE_HEALTH, useClass: PrismaDatabaseHealth },
    AppValidationPipe,
    { provide: APP_PIPE, useExisting: AppValidationPipe },
    { provide: APP_FILTER, useClass: ApplicationExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
  ],
})
export class HttpModule {}
