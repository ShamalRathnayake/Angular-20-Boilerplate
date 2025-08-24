import { EnvConfig, envObject, EnvSchema } from './env.schema';

const parsed = EnvSchema.safeParse(envObject);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Environment validation failed. Check your .env file!');
}

export const CONFIG: EnvConfig = parsed.data;
