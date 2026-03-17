import type { Page } from 'playwright';
import type { PageContent } from '../types/crawl.js';

/**
 * Collapse whitespace and trim a string.
 */
function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts structured content from a Playwright Page object by evaluating
 * DOM queries inside the browser context, then normalizing on the Node side.
 */
export async function extractPageContent(page: Page): Promise<PageContent> {
  const url = page.url();

  const raw = await page.evaluate(() => {
    // --- title ---
    const title = document.title ?? '';

    // --- meta description ---
    const metaDesc =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement | null)?.content ?? '';

    // --- headings (h1-h6, cap at 30) ---
    const headingEls = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headings = headingEls.slice(0, 30).map((el) => ({
      level: parseInt(el.tagName.substring(1), 10),
      text: (el as HTMLElement).innerText ?? '',
    }));

    // --- body text (truncated to 4000 chars) ---
    const bodyText = (document.body?.innerText ?? '').substring(0, 4000);

    // --- images (cap at 20) ---
    const imgEls = Array.from(document.querySelectorAll('img'));
    const images = imgEls.slice(0, 20).map((img) => ({
      src: (img as HTMLImageElement).src ?? '',
      alt: (img as HTMLImageElement).alt ?? '',
    }));

    // --- Open Graph tags ---
    const ogMetaEls = Array.from(document.querySelectorAll('meta[property^="og:"]'));
    const ogTags: Record<string, string> = {};
    for (const el of ogMetaEls) {
      const property = el.getAttribute('property');
      const content = el.getAttribute('content');
      if (property && content) {
        ogTags[property] = content;
      }
    }

    // --- canonical URL ---
    const canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const canonicalUrl = canonicalEl?.href ?? null;

    // --- language ---
    const language = document.documentElement.lang || null;

    return { title, metaDescription: metaDesc, headings, bodyText, images, ogTags, canonicalUrl, language };
  });

  // Normalize all extracted text on the Node side
  return {
    url,
    title: normalizeText(raw.title),
    metaDescription: normalizeText(raw.metaDescription),
    headings: raw.headings.map((h) => ({ level: h.level, text: normalizeText(h.text) })),
    bodyText: normalizeText(raw.bodyText),
    images: raw.images.map((img) => ({ src: img.src.trim(), alt: normalizeText(img.alt) })),
    ogTags: raw.ogTags,
    canonicalUrl: raw.canonicalUrl,
    language: raw.language,
  };
}
