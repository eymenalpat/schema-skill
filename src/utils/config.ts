import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const configSchema = z.object({
  azureOpenAiEndpoint: z.string().url(),
  azureOpenAiApiKey: z.string().min(1),
  azureOpenAiDeployment: z.string().default('gpt-4o'),
  azureOpenAiApiVersion: z.string().default('2024-10-21'),
  crawlTimeout: z.number().default(30000),
  crawlRetries: z.number().default(2),
  crawlDelay: z.number().default(1500),
  maxConcurrency: z.number().default(2),
  apiRateLimit: z.number().default(50),
  maxContentLength: z.number().default(4000),
  cacheDir: z.string().default('.cache'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(overrides?: Partial<Record<string, unknown>>): Config {
  return configSchema.parse({
    azureOpenAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    azureOpenAiApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    azureOpenAiApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    crawlTimeout: Number(process.env.CRAWL_TIMEOUT) || undefined,
    crawlRetries: Number(process.env.CRAWL_RETRIES) || undefined,
    crawlDelay: Number(process.env.CRAWL_DELAY) || undefined,
    maxConcurrency: Number(process.env.MAX_CONCURRENCY) || undefined,
    apiRateLimit: Number(process.env.API_RATE_LIMIT) || undefined,
    maxContentLength: Number(process.env.MAX_CONTENT_LENGTH) || undefined,
    cacheDir: process.env.CACHE_DIR,
    ...overrides,
  });
}
