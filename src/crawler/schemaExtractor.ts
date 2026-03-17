import type { Page } from 'playwright';
import type { ExistingSchema } from '../types/crawl.js';

/**
 * Extracts existing structured data (JSON-LD and Microdata) from a page.
 * Malformed JSON-LD blocks are silently skipped with a console warning.
 */
export async function extractExistingSchemas(page: Page): Promise<ExistingSchema[]> {
  const schemas: ExistingSchema[] = [];

  // ── JSON-LD ────────────────────────────────────────────────────────────
  const jsonLdBlocks: string[] = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.map((s) => s.textContent ?? '');
  });

  for (const raw of jsonLdBlocks) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;

      // A single JSON-LD block may contain a @graph array with multiple items
      const items: Record<string, unknown>[] = Array.isArray(parsed)
        ? (parsed as Record<string, unknown>[])
        : parsed['@graph'] && Array.isArray(parsed['@graph'])
          ? (parsed['@graph'] as Record<string, unknown>[])
          : [parsed];

      for (const item of items) {
        const schemaType = Array.isArray(item['@type'])
          ? (item['@type'] as string[]).join(', ')
          : (item['@type'] as string) ?? 'Unknown';

        schemas.push({
          type: schemaType,
          format: 'json-ld',
          raw: trimmed,
          parsed: item,
        });
      }
    } catch {
      console.warn('[schemaExtractor] Skipping malformed JSON-LD block');
    }
  }

  // ── Microdata ──────────────────────────────────────────────────────────
  const microdataItems = await page.evaluate(() => {
    const scopeEls = Array.from(document.querySelectorAll('[itemscope][itemtype]'));

    return scopeEls.map((el) => {
      const itemtype = el.getAttribute('itemtype') ?? '';

      // Collect direct itemprop children (only one level deep to keep it simple)
      const propEls = Array.from(el.querySelectorAll('[itemprop]'));
      const properties: Record<string, string> = {};

      for (const propEl of propEls) {
        const propName = propEl.getAttribute('itemprop');
        if (!propName) continue;

        // Determine value: content attr > href/src attr > textContent
        const value =
          propEl.getAttribute('content') ??
          propEl.getAttribute('href') ??
          propEl.getAttribute('src') ??
          (propEl as HTMLElement).innerText ??
          '';

        // Keep first occurrence of each property
        if (!(propName in properties)) {
          properties[propName] = value.trim();
        }
      }

      return { itemtype, properties };
    });
  });

  for (const item of microdataItems) {
    // Extract short type name from the full URL (e.g. "https://schema.org/Product" -> "Product")
    const typeParts = item.itemtype.split('/');
    const shortType = typeParts[typeParts.length - 1] || item.itemtype;

    schemas.push({
      type: shortType,
      format: 'microdata',
      raw: JSON.stringify(item.properties),
      parsed: {
        '@type': shortType,
        itemtype: item.itemtype,
        ...item.properties,
      },
    });
  }

  return schemas;
}
