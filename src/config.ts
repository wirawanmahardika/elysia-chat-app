import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DB_URL: z.string().default('file:storage/chat.db'),
    COOKIE_SECRET: z
        .string()
        .min(32)
        .default('a-very-long-and-secure-secret-key-that-should-be-changed-in-production'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const config = parsedEnv.data;
export const env = config;
