import fs from 'node:fs/promises';
import path from 'node:path';

interface CacheEntry<T> {
  data: T;
  expiresAt: number | null;
  createdAt: number;
}

/**
 * A simple disk-based cache that serializes values as JSON files.
 */
export class DiskCache {
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  /**
   * Ensure the cache directory exists.
   */
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
  }

  /**
   * Convert a cache key to a safe filename.
   */
  private keyToPath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  /**
   * Retrieve a cached value by key. Returns null if not found or expired.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = this.keyToPath(key);
      const raw = await fs.readFile(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(raw);

      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        // Entry has expired; remove it
        await fs.unlink(filePath).catch(() => {});
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  /**
   * Store a value in the cache.
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttlMs - Time-to-live in milliseconds. If omitted, the entry never expires.
   */
  async set(key: string, data: unknown, ttlMs?: number): Promise<void> {
    await this.ensureDir();

    const entry: CacheEntry<unknown> = {
      data,
      expiresAt: ttlMs != null ? Date.now() + ttlMs : null,
      createdAt: Date.now(),
    };

    const filePath = this.keyToPath(key);
    await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8');
  }

  /**
   * Check whether a non-expired cache entry exists for the given key.
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Delete a cache entry.
   */
  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.keyToPath(key));
    } catch {
      // Ignore if not found
    }
  }
}
