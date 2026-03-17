import PQueue from 'p-queue';

/**
 * Creates a crawl queue with concurrency and interval-based rate limiting.
 * The interval ensures a minimum delay between requests to the same domain.
 */
export function createCrawlQueue(concurrency: number = 2, intervalMs: number = 1500): PQueue {
  return new PQueue({
    concurrency,
    interval: intervalMs,
    intervalCap: concurrency,
  });
}

/**
 * Creates an API queue that limits the number of calls per minute.
 * For example, ratePerMinute=50 means at most 50 calls every 60 seconds.
 */
export function createApiQueue(ratePerMinute: number = 50): PQueue {
  return new PQueue({
    concurrency: 1,
    interval: 60_000,
    intervalCap: ratePerMinute,
  });
}
