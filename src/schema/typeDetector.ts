import type { PageContent, ExistingSchema } from '../types/crawl.js';

interface DetectionResult {
  type: string;
  confidence: number;
  signals: string[];
}

// ---------- URL pattern rules ----------
const URL_PATTERNS: [RegExp, string][] = [
  [/\/products?\//i, 'Product'],
  [/\/shop\//i, 'Product'],
  [/\/item\//i, 'Product'],
  [/\/blog\//i, 'Article'],
  [/\/blogs?\//i, 'Article'],
  [/\/articles?\//i, 'Article'],
  [/\/news\//i, 'NewsArticle'],
  [/\/press-releases?\//i, 'NewsArticle'],
  [/\/faq/i, 'FAQPage'],
  [/\/frequently-asked-questions/i, 'FAQPage'],
  [/\/contact/i, 'ContactPage'],
  [/\/about/i, 'AboutPage'],
  [/\/about-us/i, 'AboutPage'],
  [/\/categor(y|ies)\//i, 'CollectionPage'],
  [/\/collections?\//i, 'CollectionPage'],
  [/\/events?\//i, 'Event'],
  [/\/recipe/i, 'Recipe'],
  [/\/recipes?\//i, 'Recipe'],
  [/\/review/i, 'Review'],
  [/\/how-to\//i, 'HowTo'],
  [/\/video/i, 'VideoObject'],
  [/\/course/i, 'Course'],
  [/\/job/i, 'JobPosting'],
  [/\/careers?\//i, 'JobPosting'],
];

// ---------- OG type mappings ----------
const OG_TYPE_MAP: Record<string, string> = {
  article: 'Article',
  'blog:post': 'Article',
  product: 'Product',
  'product.item': 'Product',
  'product.group': 'Product',
  'music.song': 'MusicRecording',
  'music.album': 'MusicAlbum',
  'video.movie': 'Movie',
  'video.episode': 'TVEpisode',
  'video.other': 'VideoObject',
  profile: 'ProfilePage',
  website: 'WebSite',
  book: 'Book',
  'restaurant.restaurant': 'Restaurant',
  place: 'Place',
  business: 'LocalBusiness',
};

// ---------- Heading / content keywords ----------
const CONTENT_KEYWORDS: [RegExp, string, number][] = [
  // [pattern, schema type, weight]
  [/frequently asked questions|faq|q\s*&\s*a/i, 'FAQPage', 25],
  [/add to cart|buy now|price|in stock|out of stock|\$\d+/i, 'Product', 20],
  [/recipe|ingredients|cook time|prep time|servings/i, 'Recipe', 25],
  [/how to |step \d+|instructions/i, 'HowTo', 15],
  [/posted on|published|by\s+[A-Z][a-z]+\s+[A-Z][a-z]+|reading time/i, 'Article', 15],
  [/contact us|get in touch|phone|email us|our address/i, 'ContactPage', 20],
  [/about us|our story|our team|our mission|who we are/i, 'AboutPage', 15],
  [/job opening|apply now|qualifications|responsibilities/i, 'JobPosting', 20],
  [/event|date and time|venue|register|rsvp/i, 'Event', 15],
  [/review|rating|stars|rated/i, 'Review', 10],
  [/course|enroll|curriculum|lesson|module/i, 'Course', 15],
  [/local business|opening hours|directions|visit us/i, 'LocalBusiness', 15],
];

// ---------- Existing schema type normalization ----------
function normalizeSchemaType(type: string): string {
  // Handle full URLs like "https://schema.org/Product"
  const stripped = type.replace(/^https?:\/\/schema\.org\//, '');
  return stripped;
}

function scoreFromUrlPatterns(url: string): Map<string, { score: number; signals: string[] }> {
  const scores = new Map<string, { score: number; signals: string[] }>();

  for (const [pattern, schemaType] of URL_PATTERNS) {
    if (pattern.test(url)) {
      const existing = scores.get(schemaType) ?? { score: 0, signals: [] };
      existing.score += 30;
      existing.signals.push(`URL matches pattern: ${pattern.source}`);
      scores.set(schemaType, existing);
    }
  }

  return scores;
}

function scoreFromExistingSchemas(
  existingSchemas: ExistingSchema[],
): Map<string, { score: number; signals: string[] }> {
  const scores = new Map<string, { score: number; signals: string[] }>();

  for (const schema of existingSchemas) {
    const type = normalizeSchemaType(schema.type);
    if (type && type !== 'Thing') {
      const existing = scores.get(type) ?? { score: 0, signals: [] };
      existing.score += 40;
      existing.signals.push(`Existing ${schema.format} schema of type "${type}"`);
      scores.set(type, existing);
    }
  }

  return scores;
}

function scoreFromOgTags(
  ogTags: Record<string, string>,
): Map<string, { score: number; signals: string[] }> {
  const scores = new Map<string, { score: number; signals: string[] }>();

  const ogType = ogTags['og:type']?.toLowerCase();
  if (ogType && OG_TYPE_MAP[ogType]) {
    const schemaType = OG_TYPE_MAP[ogType]!;
    const existing = scores.get(schemaType) ?? { score: 0, signals: [] };
    existing.score += 25;
    existing.signals.push(`OG type tag: "${ogType}"`);
    scores.set(schemaType, existing);
  }

  return scores;
}

function scoreFromContent(
  pageContent: PageContent,
): Map<string, { score: number; signals: string[] }> {
  const scores = new Map<string, { score: number; signals: string[] }>();

  // Combine title, headings, meta description, and body text for analysis
  const headingTexts = pageContent.headings.map((h) => h.text).join(' ');
  const combinedText = [
    pageContent.title,
    pageContent.metaDescription,
    headingTexts,
    pageContent.bodyText.slice(0, 5000),
  ].join(' ');

  for (const [pattern, schemaType, weight] of CONTENT_KEYWORDS) {
    const matches = combinedText.match(new RegExp(pattern, 'gi'));
    if (matches) {
      const existing = scores.get(schemaType) ?? { score: 0, signals: [] };
      // Scale weight by number of matches (max 3x)
      const multiplier = Math.min(matches.length, 3);
      existing.score += weight * multiplier;
      existing.signals.push(
        `Content keyword match: "${pattern.source}" (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`,
      );
      scores.set(schemaType, existing);
    }
  }

  // Check for FAQ-like patterns: question/answer structure
  const questionPatterns = pageContent.headings.filter(
    (h) => /\?$/.test(h.text.trim()) || /^(what|how|why|when|where|who|can|do|does|is|are)\s/i.test(h.text.trim()),
  );
  if (questionPatterns.length >= 3) {
    const existing = scores.get('FAQPage') ?? { score: 0, signals: [] };
    existing.score += 30;
    existing.signals.push(
      `${questionPatterns.length} question-like headings detected`,
    );
    scores.set('FAQPage', existing);
  }

  // Check for product indicators: price patterns in body text
  const priceMatches = combinedText.match(/[\$\u20AC\u00A3]\s?\d+[\.,]?\d*/g);
  if (priceMatches && priceMatches.length > 0) {
    const existing = scores.get('Product') ?? { score: 0, signals: [] };
    existing.score += 15;
    existing.signals.push(
      `Price patterns found (${priceMatches.length} occurrence${priceMatches.length > 1 ? 's' : ''})`,
    );
    scores.set('Product', existing);
  }

  return scores;
}

function mergeScores(
  ...scoreMaps: Map<string, { score: number; signals: string[] }>[]
): Map<string, { score: number; signals: string[] }> {
  const merged = new Map<string, { score: number; signals: string[] }>();

  for (const scoreMap of scoreMaps) {
    for (const [type, data] of scoreMap) {
      const existing = merged.get(type) ?? { score: 0, signals: [] };
      existing.score += data.score;
      existing.signals.push(...data.signals);
      merged.set(type, existing);
    }
  }

  return merged;
}

/**
 * Detect the page type with confidence score and supporting signals.
 */
export function detectPageTypeWithConfidence(
  pageContent: PageContent,
  existingSchemas: ExistingSchema[],
): DetectionResult {
  const urlScores = scoreFromUrlPatterns(pageContent.url);
  const schemaScores = scoreFromExistingSchemas(existingSchemas);
  const ogScores = scoreFromOgTags(pageContent.ogTags);
  const contentScores = scoreFromContent(pageContent);

  const allScores = mergeScores(urlScores, schemaScores, ogScores, contentScores);

  if (allScores.size === 0) {
    return {
      type: 'WebPage',
      confidence: 0.3,
      signals: ['No specific type signals detected; defaulting to WebPage'],
    };
  }

  // Find the type with the highest score
  let bestType = 'WebPage';
  let bestScore = 0;
  let bestSignals: string[] = [];

  for (const [type, data] of allScores) {
    if (data.score > bestScore) {
      bestType = type;
      bestScore = data.score;
      bestSignals = data.signals;
    }
  }

  // Normalize confidence to 0-1 range
  // A score of 100+ is high confidence, 50 is moderate, below 20 is low
  const confidence = Math.min(bestScore / 100, 1.0);

  // If confidence is very low, fall back to WebPage
  if (confidence < 0.15) {
    return {
      type: 'WebPage',
      confidence: 0.2,
      signals: [
        ...bestSignals,
        `Best match "${bestType}" had low confidence (${(confidence * 100).toFixed(0)}%); defaulting to WebPage`,
      ],
    };
  }

  return {
    type: bestType,
    confidence,
    signals: bestSignals,
  };
}

/**
 * Detect the Schema.org page type based on URL patterns, existing schemas,
 * OG tags, and content analysis. Returns a Schema.org type name.
 */
export function detectPageType(
  pageContent: PageContent,
  existingSchemas: ExistingSchema[],
): string {
  return detectPageTypeWithConfidence(pageContent, existingSchemas).type;
}
