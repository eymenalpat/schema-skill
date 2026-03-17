import { describe, it, expect } from 'vitest';
import { generateMarkdownReport } from '../../src/reporter/markdownReport.js';
import type { AuditResult, AuditSummary } from '../../src/types/report.js';

describe('generateMarkdownReport', () => {
  it('should generate a valid markdown report', () => {
    const results: AuditResult[] = [
      {
        url: 'https://example.com',
        pageType: 'WebPage',
        existingSchemas: [{ type: 'WebSite', format: 'json-ld', valid: true }],
        missingSchemas: ['BreadcrumbList'],
        issues: [
          { severity: 'warning', message: 'Missing BreadcrumbList', recommendation: 'Add BreadcrumbList schema' },
        ],
        suggestedSchema: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Test' },
        priority: 'medium',
        score: 65,
      },
    ];

    const summary: AuditSummary = {
      totalUrls: 1,
      crawled: 1,
      errors: 0,
      withSchema: 1,
      withoutSchema: 0,
      averageScore: 65,
      byPriority: { high: 0, medium: 1, low: 0 },
    };

    const report = generateMarkdownReport(results, summary);

    expect(report).toContain('Schema Markup Denetim Raporu');
    expect(report).toContain('https://example.com');
    expect(report).toContain('WebPage');
    expect(report).toContain('65');
    expect(report).toContain('BreadcrumbList');
    expect(report).toContain('json');
  });
});
