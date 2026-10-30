import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { PostgreSqlContainer } from '@testcontainers/postgresql';

const urlFile = join(process.cwd(), 'test/integration/.database-url');

export default async function setup(): Promise<() => Promise<void>> {
  let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;

  try {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
  } catch (error) {
    throw new Error(
      [
        'Не удалось поднять PostgreSQL через Testcontainers.',
        'Приложение целиком в Docker для этих тестов не нужно.',
        'Нужен запущенный Docker Desktop и образы:',
        '  docker pull postgres:16-alpine',
        '  docker pull testcontainers/ryuk:0.14.0',
        error instanceof Error ? error.message : String(error),
      ].join('\n'),
    );
  }

  const databaseUrl = container.getConnectionUri();
  writeFileSync(urlFile, databaseUrl);

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  return async () => {
    await container.stop();
  };
}
