import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SyncProfileCatalogUseCase } from '../../src/application/profile/sync-profile-catalog.use-case';
import { CatalogSyncStatus } from '../../src/application/profile/types/catalog-sync-result';
import { MetricName } from '../../src/infrastructure/metrics/metric-names';
import { PrismaService } from '../../src/infrastructure/persistence/prisma/prisma.service';
import { profileCatalogDraft } from '../../src/infrastructure/seed/profile-catalog.data';

import { createTestApp } from './create-test-app';

const PROFILE_QUERY = `
  query ProfileCard {
    profile {
      name
      description
      skills { name }
      experience { company position }
      projects { name }
    }
  }
`;

const DETAILED_QUERY = `
  query ProfileCard {
    profile {
      name
      description
      links { kind label url }
      skills { name category }
      experience { company position startDate endDate isCurrent achievements }
      projects { name url summary skills { name } }
    }
  }
`;

describe('HTTP и GraphQL визитки', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('отвечает на liveness и readiness', async () => {
    await request(app.getHttpServer()).get('/live').expect(200).expect({ status: 'ok' });
    await request(app.getHttpServer()).get('/ready').expect(200).expect({ status: 'ok' });
  });

  it('отдает метрики, swagger и sandbox', async () => {
    const metrics = await request(app.getHttpServer()).get('/metrics').expect(200);
    expect(metrics.text).toContain(MetricName.HttpRequests);
    expect(metrics.text).toContain(MetricName.CatalogSync);

    await request(app.getHttpServer()).get('/docs-json').expect(200);
    const sandbox = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);
    expect(sandbox.headers['content-type']).toContain('text/html');
  });

  it('возвращает профиль в форме из задания', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: PROFILE_QUERY })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile).toMatchObject({
      name: profileCatalogDraft.name,
      description: profileCatalogDraft.description,
    });
    expect(response.body.data.profile.skills).toHaveLength(profileCatalogDraft.skills.length);
    expect(response.body.data.profile.experience).toHaveLength(
      profileCatalogDraft.experience.length,
    );
    expect(response.body.data.profile.projects).toHaveLength(profileCatalogDraft.projects.length);
  });

  it('отдает вложенные достижения и навыки проектов', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: DETAILED_QUERY })
      .expect(200);

    const profile = response.body.data.profile;
    const latest = profile.experience.find(
      (item: { company: string }) => item.company === 'AT Systems',
    );
    expect(latest.achievements.length).toBeGreaterThan(0);
    expect(latest.isCurrent).toBe(false);
    expect(latest.endDate).toBe(
      profileCatalogDraft.experience.find((item) => item.company === 'AT Systems')?.endDate,
    );
    expect(profile.projects[0].skills.map((skill: { name: string }) => skill.name)).toEqual(
      expect.arrayContaining(['NestJS']),
    );
  });

  it('после вложенного запроса считает GraphQL-операцию', async () => {
    const metrics = await request(app.getHttpServer()).get('/metrics').expect(200);
    expect(metrics.text).toContain(MetricName.GraphqlOperations);
  });

  it('возвращает ошибку валидации запроса и тот же request id', async () => {
    const requestId = uuidv4();
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('x-request-id', requestId)
      .send({ query: 'query { profile { missing } }' })
      .expect(400);

    expect(response.headers['x-request-id']).toBe(requestId);
    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'GRAPHQL_VALIDATION_FAILED',
      requestId,
    });
  });

  it('оборачивает неизвестный маршрут', async () => {
    const requestId = uuidv4();
    const response = await request(app.getHttpServer())
      .get('/missing')
      .set('x-request-id', requestId)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      requestId,
    });
  });

  it('повторная синхронизация не плодит строки', async () => {
    const prisma = app.get(PrismaService);
    const before = await prisma.profile.findUniqueOrThrow({
      where: { slug: profileCatalogDraft.slug },
    });
    const result = await app.get(SyncProfileCatalogUseCase).execute(profileCatalogDraft);
    const after = await prisma.profile.findUniqueOrThrow({
      where: { slug: profileCatalogDraft.slug },
    });

    expect(result.status).toBe(CatalogSyncStatus.Unchanged);
    expect(after.version).toBe(before.version);
    expect(await prisma.skill.count({ where: { profileId: before.id } })).toBe(
      profileCatalogDraft.skills.length,
    );
  });

  it('восстанавливает каталог, если строка навыка была изменена', async () => {
    const prisma = app.get(PrismaService);
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { slug: profileCatalogDraft.slug },
    });
    const skill = await prisma.skill.findFirstOrThrow({
      where: { profileId: profile.id, name: 'NestJS' },
    });
    await prisma.skill.update({ where: { id: skill.id }, data: { name: 'NestJS-drift' } });

    const result = await app.get(SyncProfileCatalogUseCase).execute(profileCatalogDraft);
    const restored = await prisma.profile.findUniqueOrThrow({
      where: { slug: profileCatalogDraft.slug },
    });

    expect(result.status).toBe(CatalogSyncStatus.Updated);
    expect(restored.id).toBe(profile.id);
    expect(restored.version).toBe(profile.version + 1);
    await expect(
      prisma.skill.findFirst({ where: { profileId: profile.id, name: 'NestJS' } }),
    ).resolves.toBeTruthy();
  });

  it('не даёт сохранить вторую открытую роль и перевёрнутый период', async () => {
    const prisma = app.get(PrismaService);
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { slug: profileCatalogDraft.slug },
    });

    await prisma.experience.create({
      data: {
        profileId: profile.id,
        company: 'Другая',
        position: 'Консультант',
        startDate: '2024-01-01',
        endDate: null,
        sortOrder: 50,
      },
    });

    await expect(
      prisma.experience.create({
        data: {
          profileId: profile.id,
          company: 'Ещё одна',
          position: 'Консультант',
          startDate: '2024-02-01',
          endDate: null,
          sortOrder: 51,
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.experience.create({
        data: {
          profileId: profile.id,
          company: 'Другая',
          position: 'Стажёр',
          startDate: '2024-05-01',
          endDate: '2024-01-01',
          sortOrder: 51,
        },
      }),
    ).rejects.toThrow();
  });
});

describe('негативные маршруты', () => {
  it('возвращает PROFILE_NOT_FOUND для чужого слага', async () => {
    const app = await createTestApp({ slug: 'missing-profile' });
    try {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: PROFILE_QUERY })
        .expect(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe('PROFILE_NOT_FOUND');
    } finally {
      await app.close();
    }
  });

  it('режет слишком глубокий запрос', async () => {
    process.env.GRAPHQL_DEPTH_LIMIT = '2';
    const app = await createTestApp();
    try {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: 'query { profile { skills { name } } }' })
        .expect(400);
      expect(response.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
    } finally {
      process.env.GRAPHQL_DEPTH_LIMIT = '8';
      await app.close();
    }
  });

  it('readiness падает, когда база недоступна для пробы', async () => {
    const app = await createTestApp({ databaseAvailable: false });
    try {
      const response = await request(app.getHttpServer()).get('/ready').expect(503);
      expect(response.body.code).toBe('NOT_READY');
    } finally {
      await app.close();
    }
  });

  it('liveness падает при застрявшем event loop', async () => {
    const app = await createTestApp({ eventLoopHealthy: false });
    try {
      const response = await request(app.getHttpServer()).get('/live').expect(503);
      expect(response.body.code).toBe('NOT_LIVE');
    } finally {
      await app.close();
    }
  });
});
