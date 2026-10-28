import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/config.module';
import { AppLoggerModule } from './infrastructure/logger/logger.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';
import { RuntimeModule } from './infrastructure/runtime/runtime.module';
import { GraphqlApiModule } from './presentation/graphql/graphql.module';
import { HttpModule } from './presentation/http/http.module';
import { RequestContextModule } from './presentation/http/request-context.module';
import { ProfileModule } from './profile.module';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    RequestContextModule,
    MetricsModule,
    RuntimeModule,
    ProfileModule,
    HttpModule,
    GraphqlApiModule,
  ],
})
export class AppModule {}
