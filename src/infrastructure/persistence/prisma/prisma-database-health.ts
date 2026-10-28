import { Injectable } from '@nestjs/common';

import type { DatabaseHealthCheck } from '../../../application/probes/ports/probe-checks.port';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaDatabaseHealth implements DatabaseHealthCheck {
  constructor(private readonly prisma: PrismaService) {}

  async ping(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
