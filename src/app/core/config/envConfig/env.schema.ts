import { z } from 'zod';

export const EnvSchema = z.object({
  NG_APP_API_URL: z.string().url(),
  NG_APP_APP_NAME: z.string().min(1),
  NG_APP_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true'),
  NG_APP_STORAGE_KEY: z.string().min(1),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
