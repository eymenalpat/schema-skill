import { describe, it, expect } from 'vitest';
import { validateUrl, validateCsvFile } from '../../src/input/validators.js';

describe('validateUrl', () => {
  it('should accept valid HTTPS URL', () => {
    const result = validateUrl('https://example.com');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('https://example.com/');
  });

  it('should add https:// when missing protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.normalized).toContain('https://');
  });

  it('should reject empty URL', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
  });

  it('should reject URL with spaces', () => {
    const result = validateUrl('https://example .com');
    expect(result.valid).toBe(false);
  });

  it('should accept URL with path', () => {
    const result = validateUrl('https://example.com/path/to/page');
    expect(result.valid).toBe(true);
  });
});

describe('validateCsvFile', () => {
  it('should reject non-csv extension', () => {
    const result = validateCsvFile('/tmp/test.txt');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('.csv');
  });

  it('should reject non-existent file', () => {
    const result = validateCsvFile('/tmp/nonexistent.csv');
    expect(result.valid).toBe(false);
  });

  it('should reject empty path', () => {
    const result = validateCsvFile('');
    expect(result.valid).toBe(false);
  });
});
