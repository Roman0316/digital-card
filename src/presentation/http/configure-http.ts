import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { RoutePath } from '../../shared/constants/routes';

export function configureHttp(app: INestApplication): void {
  app.enableCors({ origin: true });

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
