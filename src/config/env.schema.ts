import { z } from 'zod';

const envBoolean = (defaultValue: 'true' | 'false') =>
  z
    .enum(['true', 'false'])
    .default(defaultValue)
    .transform((value) => value === 'true');

const envInteger = (defaultValue: number, min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).default(defaultValue);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().min(1).max(80).default('digital-card'),
  APP_PORT: envInteger(3000, 0, 65_535),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a PostgreSQL connection string',
    }),
  DATABASE_CONNECT_ATTEMPTS: envInteger(10, 1, 50),
  DATABASE_CONNECT_DELAY_MS: envInteger(500, 50, 10_000),
  DATABASE_TRANSACTION_TIMEOUT_MS: envInteger(15_000, 1_000, 120_000),
  DATABASE_LOG_QUERIES: envBoolean('false'),
  GRAPHQL_SANDBOX_ENABLED: envBoolean('true'),
  GRAPHQL_INTROSPECTION_ENABLED: envBoolean('true'),
  GRAPHQL_DEPTH_LIMIT: envInteger(8, 1, 20),
  EVENT_LOOP_LAG_THRESHOLD_MS: envInteger(2_000, 100, 60_000),
  SHUTDOWN_TIMEOUT_MS: envInteger(10_000, 1_000, 120_000),
});

export type Env = z.infer<typeof envSchema>;

export function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('; ');
}
