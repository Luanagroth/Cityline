import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TRANSPORT_CACHE_TTL_MS: z.coerce.number().default(300_000),
  CITYLINE_EXTERNAL_API_URL: z.string().url().optional().or(z.literal('')).transform((value) => value || undefined),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(16).default('cityline-dev-secret-change-me'),
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  TRANSPORT_CACHE_TTL_MS: process.env.TRANSPORT_CACHE_TTL_MS,
  CITYLINE_EXTERNAL_API_URL: process.env.CITYLINE_EXTERNAL_API_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
});
