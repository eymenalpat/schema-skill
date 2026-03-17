import { describe, it, expect } from 'vitest';
import { detectPageType, detectPageTypeWithConfidence } from '../../src/schema/typeDetector.js';
import type { PageContent, ExistingSchema } from '../../src/types/crawl.js';

function makePageContent(overrides: Partial<PageContent> = {}): PageContent {
  return {
    url: 'https://example.com',
    title: 'Test Page',
    metaDescription: '',
    headings: [],
    bodyText: '',
    images: [],
    ogTags: {},
    canonicalUrl: null,
    language: null,
    ...overrides,
  };
}

describe('detectPageType', () => {
  it('should detect Product from URL pattern', () => {
    const content = makePageContent({ url: 'https://example.com/products/widget' });
    expect(detectPageType(content, [])).toBe('Product');
  });

  it('should detect Article from URL pattern', () => {
    const content = makePageContent({ url: 'https://example.com/blog/my-post' });
    expect(detectPageType(content, [])).toBe('Article');
  });

  it('should detect FAQPage from URL pattern', () => {
    const content = makePageContent({ url: 'https://example.com/faq' });
    expect(detectPageType(content, [])).toBe('FAQPage');
  });

  it('should detect type from existing schemas', () => {
    const content = makePageContent();
    const schemas: ExistingSchema[] = [
      { type: 'Product', format: 'json-ld', raw: '{}', parsed: {} },
    ];
    expect(detectPageType(content, schemas)).toBe('Product');
  });

  it('should detect type from OG tags', () => {
    const content = makePageContent({ ogTags: { 'og:type': 'article' } });
    expect(detectPageType(content, [])).toBe('Article');
  });

  it('should detect FAQPage from question-like headings', () => {
    const content = makePageContent({
      headings: [
        { level: 2, text: 'What is Schema.org?' },
        { level: 2, text: 'How do I implement structured data?' },
        { level: 2, text: 'Why is structured data important?' },
        { level: 2, text: 'When should I use JSON-LD?' },
      ],
    });
    expect(detectPageType(content, [])).toBe('FAQPage');
  });

  it('should default to WebPage when no signals', () => {
    const content = makePageContent();
    expect(detectPageType(content, [])).toBe('WebPage');
  });

  it('should return confidence score', () => {
    const content = makePageContent({ url: 'https://example.com/products/widget' });
    const result = detectPageTypeWithConfidence(content, []);
    expect(result.type).toBe('Product');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThan(0);
  });
});
