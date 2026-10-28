import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoNestLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import type { AppConfig } from './config/app.config';
import { APP_CONFIG } from './config/tokens';
import { configureHttp } from './presentation/http/configure-http';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(PinoNestLogger);
  app.useLogger(logger);
  app.enableShutdownHooks();
  configureHttp(app);

  const config = app.get<AppConfig>(APP_CONFIG);
  await app.listen(config.port, '0.0.0.0');
  logger.log(`Listening on port ${config.port}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error(error instanceof Error ? error.message : 'Application failed to start');
  process.exit(1);
});
