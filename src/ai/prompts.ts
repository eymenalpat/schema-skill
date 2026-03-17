import type { PageContent, ExistingSchema } from '../types/crawl.js';

export interface PromptMessage {
  role: 'system' | 'user';
  content: string;
}

export interface GeneratePromptParams {
  pageContent: PageContent;
  detectedType: string;
  vocabularyInfo: string;
  existingSchemas: ExistingSchema[];
}

export interface AuditPromptParams {
  pageContent: PageContent;
  existingSchemas: ExistingSchema[];
  vocabularyInfo: string;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '... [truncated]';
}

function formatHeadings(headings: { level: number; text: string }[]): string {
  return headings
    .map((h) => `${'#'.repeat(h.level)} ${h.text}`)
    .join('\n');
}

function formatExistingSchemas(schemas: ExistingSchema[]): string {
  if (schemas.length === 0) return 'None found on the page.';
  return schemas
    .map(
      (s, i) =>
        `Schema ${i + 1} (${s.format}):\nType: ${s.type}\n${JSON.stringify(s.parsed, null, 2)}`,
    )
    .join('\n\n');
}

export function buildGeneratePrompt(
  params: GeneratePromptParams,
): [PromptMessage, PromptMessage] {
  const { pageContent, detectedType, vocabularyInfo, existingSchemas } = params;

  const systemMessage: PromptMessage = {
    role: 'system',
    content: `You are a Schema.org structured data expert. Your task is to generate valid JSON-LD markup for web pages.

Rules:
- Analyze the page and determine ALL appropriate schema types for the page
- For a homepage: Organization + WebSite + SearchAction (+ LocalBusiness if applicable)
- For product pages: Product + Offer + BreadcrumbList
- For blog posts: BlogPosting/Article + BreadcrumbList
- For category pages: ItemList + BreadcrumbList
- For FAQ pages: FAQPage + BreadcrumbList
- For all inner pages: include BreadcrumbList
- Return a JSON object with key "schemas" containing an array of JSON-LD objects
- Each schema in the array must be a complete, valid JSON-LD object with "@context": "https://schema.org" and "@type"
- Use ONLY properties from the provided vocabulary information below
- Follow Google's structured data guidelines strictly
- Populate properties using actual data extracted from the page content
- Use appropriate nested types where relevant (e.g., Organization for publisher, ImageObject for images)
- If existing schemas are present, improve upon them rather than duplicating
- Return ONLY the JSON object as valid JSON. No explanation, no markdown, no code fences.

Example response format:
{
  "schemas": [
    { "@context": "https://schema.org", "@type": "Organization", "name": "..." },
    { "@context": "https://schema.org", "@type": "WebSite", "name": "..." }
  ]
}`,
  };

  const headingsFormatted = formatHeadings(pageContent.headings);
  const existingSchemasFormatted = formatExistingSchemas(existingSchemas);
  const bodyTextTruncated = truncateText(pageContent.bodyText, 3000);

  const userMessage: PromptMessage = {
    role: 'user',
    content: `Generate a JSON-LD structured data markup for the following page.

**URL:** ${pageContent.url}
**Title:** ${pageContent.title}
**Meta Description:** ${pageContent.metaDescription}
**Canonical URL:** ${pageContent.canonicalUrl ?? 'N/A'}
**Language:** ${pageContent.language ?? 'N/A'}

**Detected Page Type:** ${detectedType}

**Available Schema.org Properties for ${detectedType}:**
${vocabularyInfo}

**Existing Schemas on the Page:**
${existingSchemasFormatted}

**Page Headings:**
${headingsFormatted || 'No headings found.'}

**OG Tags:**
${Object.entries(pageContent.ogTags).map(([k, v]) => `${k}: ${v}`).join('\n') || 'None'}

**Images:**
${pageContent.images.slice(0, 10).map((img) => `- src: ${img.src}, alt: ${img.alt}`).join('\n') || 'None'}

**Page Content (truncated):**
${bodyTextTruncated}

Generate all appropriate JSON-LD schemas for this page. The primary detected type is "${detectedType}", but include all other relevant schema types as well.`,
  };

  return [systemMessage, userMessage];
}

export interface FixPromptParams {
  originalSchemas: Record<string, unknown>[];
  validationErrors: { schemaType: string; errors: string[]; warnings: string[] }[];
}

export function buildFixPrompt(
  params: FixPromptParams,
): [PromptMessage, PromptMessage] {
  const systemMessage: PromptMessage = {
    role: 'system',
    content: `You are a Schema.org structured data expert. You previously generated JSON-LD schemas but they have validation errors. Fix ALL the errors and return corrected schemas.

Rules:
- Fix every reported error and warning
- Keep the same schema types and structure — only fix the problems
- Each schema must have "@context": "https://schema.org" and a valid "@type"
- All required properties for the type must be present (per Google Rich Results guidelines)
- Property names must be valid for the declared @type
- URL fields must contain valid URLs
- Return a JSON object with key "schemas" containing the corrected array
- Return ONLY valid JSON. No explanation.`,
  };

  const schemasJson = JSON.stringify(params.originalSchemas, null, 2);
  const errorsFormatted = params.validationErrors
    .map((ve) => {
      const lines = [`Schema @type="${ve.schemaType}":`];
      for (const e of ve.errors) lines.push(`  ERROR: ${e}`);
      for (const w of ve.warnings) lines.push(`  WARNING: ${w}`);
      return lines.join('\n');
    })
    .join('\n\n');

  const userMessage: PromptMessage = {
    role: 'user',
    content: `Fix the following JSON-LD schemas. The validation errors are listed below.

**Current Schemas (with errors):**
${schemasJson}

**Validation Errors:**
${errorsFormatted}

Return the corrected schemas in { "schemas": [...] } format.`,
  };

  return [systemMessage, userMessage];
}

export function buildAuditPrompt(
  params: AuditPromptParams,
): [PromptMessage, PromptMessage] {
  const { pageContent, existingSchemas, vocabularyInfo } = params;

  const systemMessage: PromptMessage = {
    role: 'system',
    content: `You are a Schema.org structured data auditor. Your task is to analyze existing structured data on a web page and provide improvement recommendations.

You must return a JSON object with the following structure:
{
  "pageType": "detected Schema.org type (e.g., Article, Product, FAQPage)",
  "existingSchemaAnalysis": [
    {
      "type": "the @type of the existing schema",
      "valid": true/false,
      "issues": ["list of specific issues found"]
    }
  ],
  "missingSchemas": ["list of recommended schema types not yet present"],
  "suggestedSchema": { ... the recommended JSON-LD object ... },
  "priority": "high" | "medium" | "low",
  "score": 0-100,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "message": "description of the issue",
      "recommendation": "how to fix it"
    }
  ]
}

Scoring guidelines:
- 90-100: Excellent structured data coverage, all required properties present
- 70-89: Good coverage with minor improvements possible
- 50-69: Moderate coverage, important properties missing
- 30-49: Poor coverage, significant schemas missing
- 0-29: No or critically broken structured data

Priority guidelines:
- "high": No structured data, or existing data has critical errors
- "medium": Structured data exists but has notable gaps or issues
- "low": Good structured data with only minor improvements possible

Return ONLY valid JSON. No explanation, no markdown, no code fences.`,
  };

  const headingsFormatted = formatHeadings(pageContent.headings);
  const existingSchemasFormatted = formatExistingSchemas(existingSchemas);
  const bodyTextTruncated = truncateText(pageContent.bodyText, 3000);

  const userMessage: PromptMessage = {
    role: 'user',
    content: `Audit the structured data for the following page.

**URL:** ${pageContent.url}
**Title:** ${pageContent.title}
**Meta Description:** ${pageContent.metaDescription}
**Canonical URL:** ${pageContent.canonicalUrl ?? 'N/A'}
**Language:** ${pageContent.language ?? 'N/A'}

**Existing Schemas on the Page:**
${existingSchemasFormatted}

**Available Schema.org Vocabulary:**
${vocabularyInfo}

**Page Headings:**
${headingsFormatted || 'No headings found.'}

**OG Tags:**
${Object.entries(pageContent.ogTags).map(([k, v]) => `${k}: ${v}`).join('\n') || 'None'}

**Images:**
${pageContent.images.slice(0, 10).map((img) => `- src: ${img.src}, alt: ${img.alt}`).join('\n') || 'None'}

**Page Content (truncated):**
${bodyTextTruncated}

Analyze the existing schemas, identify issues, and provide a recommended improved schema.`,
  };

  return [systemMessage, userMessage];
}
