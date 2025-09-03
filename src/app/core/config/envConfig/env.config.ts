import { EnvConfig, EnvSchema } from './env.schema';

const envObject = {
  NG_APP_API_URL: import.meta?.env['NG_APP_API_URL'],
  NG_APP_APP_NAME: import.meta?.env['NG_APP_APP_NAME'],
  NG_APP_ENABLE_ANALYTICS: import.meta?.env['NG_APP_ENABLE_ANALYTICS'],
  NG_APP_STORAGE_KEY: import.meta?.env['NG_APP_STORAGE_KEY'],
};

const parsed = EnvSchema.safeParse(envObject);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Environment validation failed. Check your .env file!');
}

export const CONFIG: EnvConfig = parsed.data;
