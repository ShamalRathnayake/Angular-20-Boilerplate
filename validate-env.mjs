import dotenv from 'dotenv';
import { EnvSchema } from './src/app/core/config/envConfig/env.schema.ts';
dotenv.config({
  path: process.env['NODE_ENV'] === 'development' ? './.env.development' : './.env.production',
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid .env file:', parsed.error.format());
  process.exit(1);
}

console.log('✅ .env validation passed');
