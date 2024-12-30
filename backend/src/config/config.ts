import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AUTH_DISABLED: z.string().optional(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(envVars.error.format(), null, 4));
  process.exit(1);
}

export const config = {
  env: envVars.data.NODE_ENV,
  port: parseInt(envVars.data.PORT, 10),
  mongoose: {
    url: envVars.data.MONGODB_URI
  },
  jwt: {
    secret: envVars.data.JWT_SECRET
  },
  aws: {
    accessKeyId: envVars.data.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.data.AWS_SECRET_ACCESS_KEY,
    region: envVars.data.AWS_REGION,
    bucketName: envVars.data.AWS_BUCKET_NAME
  },
  security: {
    isAuthDisabled: envVars.data.AUTH_DISABLED === 'true',
  }
};