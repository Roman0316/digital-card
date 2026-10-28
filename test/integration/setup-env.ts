import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const databaseUrl = readFileSync(
  join(process.cwd(), 'test/integration/.database-url'),
  'utf8',
).trim();

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = databaseUrl;
process.env.LOG_LEVEL = 'silent';
process.env.APP_PORT = '0';
process.env.GRAPHQL_SANDBOX_ENABLED = 'true';
process.env.GRAPHQL_INTROSPECTION_ENABLED = 'true';
process.env.GRAPHQL_DEPTH_LIMIT = '8';
