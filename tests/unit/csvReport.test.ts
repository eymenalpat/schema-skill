import { describe, it, expect } from 'vitest';
import { generateCsvReport } from '../../src/reporter/csvReport.js';
import type { AuditResult } from '../../src/types/report.js';

describe('generateCsvReport', () => {
  it('should generate CSV with correct columns', async () => {
    const results: AuditResult[] = [
      {
        url: 'https://example.com',
        pageType: 'WebPage',
        existingSchemas: [],
        missingSchemas: ['WebSite'],
        issues: [],
        suggestedSchema: null,
        priority: 'high',
        score: 20,
      },
    ];

    const csv = await generateCsvReport(results);
    expect(csv).toContain('URL');
    expect(csv).toContain('Sayfa Tipi');
    expect(csv).toContain('https://example.com');
    expect(csv).toContain('WebPage');
  });
});
