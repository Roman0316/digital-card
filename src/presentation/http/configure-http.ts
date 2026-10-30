import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';

import { RoutePath } from '../../shared/constants/routes';

export function configureHttp(app: INestApplication): void {
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Apollo-Require-Preflight',
      'x-request-id',
      'x-apollo-operation-name',
    ],
  });

  // Embedded Apollo Sandbox грузится с публичного CDN и ходит на localhost.
  // Chrome требует явного разрешения Private Network Access на preflight.
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.headers['access-control-request-private-network'] === 'true') {
      response.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    next();
  });

  const documentConfig = new DocumentBuilder()
    .setTitle('Цифровая визитка')
    .setDescription(
      'Операционные HTTP-маршруты. Профиль, опыт, навыки и проекты отдаёт GraphQL POST /graphql',
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup(RoutePath.Docs, app, document, { customSiteTitle: 'Цифровая визитка' });
}
