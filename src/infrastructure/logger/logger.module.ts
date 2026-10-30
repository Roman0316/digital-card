import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import type { LoggerConfig } from '../../config/interfaces/logger-config.interface';
import { LOGGER_CONFIG } from '../../config/tokens';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [LOGGER_CONFIG],
      useFactory: (config: LoggerConfig) => ({
        pinoHttp: {
          level: config.level,
          autoLogging: false,
          quietReqLogger: true,
          transport: config.pretty
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        },
      }),
    }),
  ],
})
export class AppLoggerModule {}
