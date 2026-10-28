import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import type { DatabaseConfig } from '../../../config/database.config';
import { DATABASE_CONFIG } from '../../../config/tokens';
import { PrismaClient } from '../../../generated/prisma/client';

export type DbClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly config: DatabaseConfig;

  constructor(@Inject(DATABASE_CONFIG) config: DatabaseConfig) {
    const adapter = new PrismaPg({ connectionString: config.url });
    super({ adapter });
    this.config = config;
  }

  async onModuleInit(): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.config.connectAttempts; attempt += 1) {
      try {
        await this.$connect();
        await this.$queryRaw`SELECT 1`;
        return;
      } catch (error) {
        lastError = error;
        if (attempt === this.config.connectAttempts) {
          break;
        }
        await delay(this.config.connectDelayMs * attempt);
      }
    }

    throw lastError;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
