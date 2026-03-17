import { describe, it, expect } from 'vitest';
import { parseCsvInput } from '../../src/input/csvParser.js';
import path from 'node:path';

const fixturesDir = path.join(import.meta.dirname, '..', 'fixtures');

describe('parseCsvInput', () => {
  it('should parse test CSV file', async () => {
    const rows = await parseCsvInput(path.join(fixturesDir, 'test-input.csv'));
    expect(rows.length).toBe(5);
    expect(rows[0]!.url).toBe('https://example.com');
    expect(rows[0]!.pageType).toBe('WebPage');
    expect(rows[0]!.priority).toBe('high');
  });

  it('should throw for non-existent file', async () => {
    await expect(parseCsvInput('/nonexistent.csv')).rejects.toThrow();
  });
});
