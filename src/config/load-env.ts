import { config as loadDotenv } from 'dotenv';

import { envSchema, formatEnvError, type Env } from './env.schema';

let dotenvLoaded = false;

export function loadEnv(source?: NodeJS.ProcessEnv): Env {
  if (!source && !dotenvLoaded) {
    loadDotenv();
    dotenvLoaded = true;
  }

  const parsed = envSchema.safeParse(source ?? process.env);
  if (!parsed.success) {
    throw new Error(`Некорректные переменные окружения: ${formatEnvError(parsed.error)}`);
  }

  return parsed.data;
}
