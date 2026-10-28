import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { Inject, Injectable } from '@nestjs/common';

import type { DatabaseConfig } from '../../../config/database.config';
import { DATABASE_CONFIG, RUNTIME_ENVIRONMENT, WORKING_DIRECTORY } from '../../../config/tokens';

import { PrismaService } from './prisma.service';

const execFileAsync = promisify(execFile);

@Injectable()
export class DatabaseMigrator {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(DATABASE_CONFIG) private readonly databaseConfig: DatabaseConfig,
    @Inject(RUNTIME_ENVIRONMENT) private readonly runtimeEnvironment: NodeJS.ProcessEnv,
    @Inject(WORKING_DIRECTORY) private readonly workingDirectory: string,
  ) {}

  async deploy(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;

    const entrypoint = join(this.workingDirectory, 'node_modules', 'prisma', 'build', 'index.js');
    try {
      await execFileAsync(process.execPath, [entrypoint, 'migrate', 'deploy'], {
        cwd: this.workingDirectory,
        env: {
          ...this.runtimeEnvironment,
          DATABASE_URL: this.databaseConfig.url,
        },
      });
    } catch (error) {
      const stderr = readStderr(error).replaceAll(this.databaseConfig.url, '[redacted]');
      throw new Error(`Не удалось применить миграции базы данных. ${stderr}`.trim());
    }
  }
}

function readStderr(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'stderr' in error) {
    const stderr = error.stderr;
    if (typeof stderr === 'string') {
      return stderr;
    }
    if (stderr instanceof Buffer) {
      return stderr.toString('utf8');
    }
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка миграции';
}
