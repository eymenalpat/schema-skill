import { chromium, type Browser, type Page } from 'playwright';
import { extractPageContent } from './pageExtractor.js';
import { extractExistingSchemas } from './schemaExtractor.js';
import type { CrawlResult, PageContent } from '../types/crawl.js';

export interface CrawlOptions {
  /** Navigation + rendering timeout in milliseconds. Default 30 000. */
  timeout?: number;
  /** Number of retry attempts on failure. Default 2. */
  retries?: number;
  /** Extra milliseconds to wait after domcontentloaded for JS rendering. Default 3 000. */
  extraWait?: number;
}

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_EXTRA_WAIT = 3_000;

/**
 * Build an empty PageContent stub used when a crawl fails before any
 * content can be extracted.
 */
function emptyPageContent(url: string): PageContent {
  return {
    url,
    title: '',
    metaDescription: '',
    headings: [],
    bodyText: '',
    images: [],
    ogTags: {},
    canonicalUrl: null,
    language: null,
  };
}

/**
 * Creates a reusable crawler backed by a single Chromium browser instance.
 *
 * Usage:
 * ```ts
 * const crawler = await createCrawler();
 * const result = await crawler.crawl('https://example.com');
 * await crawler.close();
 * ```
 */
export async function createCrawler() {
  let browser: Browser = await chromium.launch({ headless: true });

  /**
   * Ensure the browser is still connected; re-launch if it was closed
   * unexpectedly (defensive).
   */
  async function ensureBrowser(): Promise<Browser> {
    if (!browser.isConnected()) {
      browser = await chromium.launch({ headless: true });
    }
    return browser;
  }

  /**
   * Execute a single crawl attempt (no retries).
   */
  async function attemptCrawl(
    url: string,
    timeout: number,
    extraWait: number,
  ): Promise<CrawlResult> {
    const activeBrowser = await ensureBrowser();
    const context = await activeBrowser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    let page: Page | null = null;
    let statusCode = 0;

    try {
      page = await context.newPage();
      page.setDefaultTimeout(timeout);

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout,
      });

      statusCode = response?.status() ?? 0;

      // Allow extra time for client-side JS to render content
      await page.waitForTimeout(extraWait);

      const [pageContent, existingSchemas] = await Promise.all([
        extractPageContent(page),
        extractExistingSchemas(page),
      ]);

      return {
        url,
        pageContent,
        existingSchemas,
        statusCode,
      };
    } finally {
      // Always clean up the context (which also closes the page)
      await context.close().catch(() => {});
    }
  }

  /**
   * Crawl a URL, returning structured page content and any existing schemas.
   * Retries on transient failures up to `options.retries` times.
   */
  async function crawl(url: string, options?: CrawlOptions): Promise<CrawlResult> {
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    const retries = options?.retries ?? DEFAULT_RETRIES;
    const extraWait = options?.extraWait ?? DEFAULT_EXTRA_WAIT;

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await attemptCrawl(url, timeout, extraWait);
      } catch (err) {
        lastError = err;
        // Only log retries, not the initial attempt failure
        if (attempt < retries) {
          console.warn(
            `[crawler] Attempt ${attempt + 1} failed for ${url}, retrying... (${err instanceof Error ? err.message : String(err)})`,
          );
        }
      }
    }

    // All attempts exhausted - return a result with the error field set
    const errorMessage =
      lastError instanceof Error ? lastError.message : String(lastError);

    return {
      url,
      pageContent: emptyPageContent(url),
      existingSchemas: [],
      statusCode: 0,
      error: errorMessage,
    };
  }

  /**
   * Shut down the browser. Safe to call multiple times.
   */
  async function close(): Promise<void> {
    if (browser.isConnected()) {
      await browser.close();
    }
  }

  return { crawl, close };
}
