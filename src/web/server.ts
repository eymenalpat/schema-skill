import express from 'express';
import type { Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createCrawler } from '../crawler/index.js';
import {
  detectPageType,
  detectPageTypeWithConfidence,
} from '../schema/typeDetector.js';
import { createVocabularyManager } from '../schema/vocabularyManager.js';
import { generateSchema, auditSchema } from '../ai/schemaGenerator.js';
import { validateJsonLd } from '../schema/validator.js';
import { validateUrl } from '../input/validators.js';
import { generateMarkdownReport } from '../reporter/markdownReport.js';
import type { AuditResult, AuditSummary } from '../types/report.js';

const PORT = 3456;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HTML = readFileSync(join(__dirname, 'index.html'), 'utf-8');

// ---------------------------------------------------------------------------
// Initialize shared resources
// ---------------------------------------------------------------------------

const vocabManager = createVocabularyManager();

console.log('[schemaSkill] Vocabulary başlatılıyor...');
vocabManager.initialize().then(() => {
  console.log('[schemaSkill] Vocabulary hazır.');
}).catch((err: unknown) => {
  console.warn('[schemaSkill] Vocabulary başlatma hatası:', err instanceof Error ? err.message : String(err));
});

console.log('[schemaSkill] Crawler başlatılıyor...');
const crawlerPromise = createCrawler();

async function getCrawler() {
  return crawlerPromise;
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML);
});

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { url, type } = req.body as { url?: string; type?: string };

    if (!url) {
      res.status(400).json({ error: 'url alanı zorunludur.' });
      return;
    }

    const urlResult = validateUrl(url);
    if (!urlResult.valid) {
      res.status(400).json({ error: urlResult.error });
      return;
    }
    const normalizedUrl = urlResult.normalized;

    await vocabManager.initialize();

    const crawler = await getCrawler();
    const crawlResult = await crawler.crawl(normalizedUrl);

    if (crawlResult.error) {
      res.status(502).json({ error: `Sayfa taranamadı: ${crawlResult.error}` });
      return;
    }

    const detectionResult = detectPageTypeWithConfidence(
      crawlResult.pageContent,
      crawlResult.existingSchemas,
    );
    const usedType = type || detectionResult.type;

    const recommendedProps = await vocabManager.getRecommendedProperties(usedType);
    const propNames = recommendedProps.map((p) => p.name);
    const vocabularyInfoStr = recommendedProps
      .map((p) => `- ${p.name}: ${p.description} (expected types: ${p.rangeTypes.join(', ')})`)
      .join('\n');

    const vocabContext = {
      isValidType: (name: string) => vocabManager.isValidTypeSync(name),
      getType: (name: string) => vocabManager.getTypeSync(name),
      getPropertiesForType: (name: string) => vocabManager.getPropertiesForTypeSync(name),
    };

    // Generate with built-in validation + auto-fix
    const generatedSchemas = await generateSchema(
      crawlResult.pageContent,
      crawlResult.existingSchemas,
      usedType,
      vocabularyInfoStr,
      async (schema) => validateJsonLd(schema, vocabContext),
    );

    // Final validation (post auto-fix)
    const validationResults = await Promise.all(
      generatedSchemas.map((schema) => validateJsonLd(schema, vocabContext)),
    );

    // Build merged @graph for CRMs that need single script tag
    const mergedSchema = generatedSchemas.length > 1
      ? {
          '@context': 'https://schema.org' as const,
          '@graph': generatedSchemas.map(({ '@context': _ctx, ...rest }) => rest),
        }
      : null;

    res.json({
      crawlResult: {
        pageContent: {
          url: crawlResult.pageContent.url,
          title: crawlResult.pageContent.title,
          metaDescription: crawlResult.pageContent.metaDescription,
          headings: crawlResult.pageContent.headings,
          images: crawlResult.pageContent.images,
          ogTags: crawlResult.pageContent.ogTags,
          canonicalUrl: crawlResult.pageContent.canonicalUrl,
          language: crawlResult.pageContent.language,
        },
        existingSchemas: crawlResult.existingSchemas,
        statusCode: crawlResult.statusCode,
      },
      detectedType: detectionResult,
      usedType,
      vocabularyInfo: {
        type: usedType,
        properties: propNames,
      },
      generatedSchemas,
      validationResults,
      mergedSchema,
      generatedSchema: generatedSchemas[0] ?? null,
      validationResult: validationResults[0] ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/generate] Hata:', message);
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/audit
// ---------------------------------------------------------------------------
app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    const { urls } = req.body as { urls?: string[] };

    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({ error: 'urls dizisi zorunludur ve en az bir URL içermelidir.' });
      return;
    }

    const validatedUrls: string[] = [];
    for (const raw of urls) {
      const result = validateUrl(raw);
      if (result.valid) {
        validatedUrls.push(result.normalized);
      }
    }

    if (validatedUrls.length === 0) {
      res.status(400).json({ error: 'Geçerli URL bulunamadı.' });
      return;
    }

    await vocabManager.initialize();
    const crawler = await getCrawler();

    const auditResults: Array<{ url: string; auditResult: AuditResult | null; error?: string }> = [];

    for (const url of validatedUrls) {
      try {
        const crawlResult = await crawler.crawl(url);

        if (crawlResult.error) {
          auditResults.push({
            url,
            auditResult: {
              url,
              pageType: 'Error',
              existingSchemas: [],
              missingSchemas: [],
              issues: [{
                severity: 'error',
                message: `Sayfa taranamadı: ${crawlResult.error}`,
                recommendation: 'URL erişilebilirliğini kontrol edin.',
              }],
              suggestedSchema: null,
              priority: 'high',
              score: 0,
            },
          });
          continue;
        }

        const detectedType = detectPageType(
          crawlResult.pageContent,
          crawlResult.existingSchemas,
        );

        const recommendedProps = await vocabManager.getRecommendedProperties(detectedType);
        const vocabularyInfoStr = recommendedProps
          .map((p) => `- ${p.name}: ${p.description} (types: ${p.rangeTypes.join(', ')})`)
          .join('\n');

        const auditResult = await auditSchema(
          crawlResult.pageContent,
          crawlResult.existingSchemas,
          vocabularyInfoStr,
        );

        auditResults.push({ url, auditResult });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        auditResults.push({
          url,
          auditResult: {
            url,
            pageType: 'Error',
            existingSchemas: [],
            missingSchemas: [],
            issues: [{ severity: 'error', message, recommendation: 'Hatayı araştırın.' }],
            suggestedSchema: null,
            priority: 'high',
            score: 0,
          },
          error: message,
        });
      }
    }

    const allResults = auditResults.map((r) => r.auditResult).filter((r): r is AuditResult => r !== null);

    const summary: AuditSummary = {
      totalUrls: validatedUrls.length,
      crawled: allResults.filter((r) => r.pageType !== 'Error').length,
      errors: allResults.filter((r) => r.pageType === 'Error').length,
      withSchema: allResults.filter((r) => r.existingSchemas.length > 0).length,
      withoutSchema: allResults.filter((r) => r.existingSchemas.length === 0 && r.pageType !== 'Error').length,
      averageScore: allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
        : 0,
      byPriority: {
        high: allResults.filter((r) => r.priority === 'high').length,
        medium: allResults.filter((r) => r.priority === 'medium').length,
        low: allResults.filter((r) => r.priority === 'low').length,
      },
    };

    const markdownReport = generateMarkdownReport(allResults, summary);

    res.json({
      results: auditResults,
      summary,
      markdownReport,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/audit] Hata:', message);
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n[schemaSkill] Web arayüzü hazır:`);
  console.log(`  http://localhost:${PORT}\n`);
});
