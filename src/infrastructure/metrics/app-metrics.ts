import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

import { HTTP_DURATION_BUCKETS, MetricName } from './metric-names';

@Injectable()
export class AppMetrics {
  readonly registry = new Registry();
  readonly httpRequests: Counter<'method' | 'route' | 'status'>;
  readonly httpDuration: Histogram<'method' | 'route' | 'status'>;
  readonly httpErrors: Counter<'method' | 'route' | 'status'>;
  readonly graphqlOperations: Counter<'operation' | 'result'>;
  readonly graphqlDuration: Histogram<'operation' | 'result'>;
  readonly graphqlErrors: Counter<'operation'>;
  readonly catalogSync: Counter<'result'>;

  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'card_' });

    this.httpRequests = new Counter({
      name: MetricName.HttpRequests,
      help: 'Количество HTTP-запросов',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });
    this.httpDuration = new Histogram({
      name: MetricName.HttpDuration,
      help: 'Длительность HTTP-запросов в секундах',
      labelNames: ['method', 'route', 'status'],
      buckets: [...HTTP_DURATION_BUCKETS],
      registers: [this.registry],
    });
    this.httpErrors = new Counter({
      name: MetricName.HttpErrors,
      help: 'HTTP-ответы с кодом 500 и выше',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });
    this.graphqlOperations = new Counter({
      name: MetricName.GraphqlOperations,
      help: 'Количество GraphQL-операций',
      labelNames: ['operation', 'result'],
      registers: [this.registry],
    });
    this.graphqlDuration = new Histogram({
      name: MetricName.GraphqlDuration,
      help: 'Длительность GraphQL-операций в секундах',
      labelNames: ['operation', 'result'],
      buckets: [...HTTP_DURATION_BUCKETS],
      registers: [this.registry],
    });
    this.graphqlErrors = new Counter({
      name: MetricName.GraphqlErrors,
      help: 'GraphQL-операции, завершившиеся ошибкой',
      labelNames: ['operation'],
      registers: [this.registry],
    });
    this.catalogSync = new Counter({
      name: MetricName.CatalogSync,
      help: 'Результаты синхронизации каталога профиля',
      labelNames: ['result'],
      registers: [this.registry],
    });
  }

  scrape(): Promise<string> {
    return this.registry.metrics();
  }

  get contentType(): string {
    return this.registry.contentType;
  }
}
