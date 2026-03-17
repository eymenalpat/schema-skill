export interface PageContent {
  url: string;
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  bodyText: string;
  images: { src: string; alt: string }[];
  ogTags: Record<string, string>;
  canonicalUrl: string | null;
  language: string | null;
}

export interface ExistingSchema {
  type: string;
  format: 'json-ld' | 'microdata' | 'rdfa';
  raw: string;
  parsed: Record<string, unknown>;
}

export interface CrawlResult {
  url: string;
  pageContent: PageContent;
  existingSchemas: ExistingSchema[];
  statusCode: number;
  error?: string;
}
