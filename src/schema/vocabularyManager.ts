import path from 'node:path';
import os from 'node:os';
import { DiskCache } from '../utils/cache.js';
import type { SchemaType, SchemaProperty } from '../types/schema.js';

// ---------------------------------------------------------------------------
// Internal node types used while indexing the JSON-LD graph
// ---------------------------------------------------------------------------

interface SchemaTypeNode {
  name: string;
  id: string;
  description: string;
  parentTypes: string[];
  /** Property names whose domainIncludes references this type */
  directPropertyNames: string[];
}

interface SchemaPropertyNode {
  name: string;
  id: string;
  description: string;
  domainTypes: string[];
  rangeTypes: string[];
}

// ---------------------------------------------------------------------------
// Raw JSON-LD shapes coming from the schema.org download
// ---------------------------------------------------------------------------

interface RawGraphNode {
  '@id': string;
  '@type': string | string[];
  'rdfs:label'?: string | { '@value': string };
  'rdfs:comment'?: string | { '@value': string };
  'rdfs:subClassOf'?: RawRef | RawRef[];
  'schema:domainIncludes'?: RawRef | RawRef[];
  'schema:rangeIncludes'?: RawRef | RawRef[];
  'schema:supersededBy'?: RawRef | RawRef[];
}

interface RawRef {
  '@id': string;
}

interface SchemaOrgVocabulary {
  '@graph': RawGraphNode[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCHEMA_ORG_URL =
  'https://schema.org/version/latest/schemaorg-current-https.jsonld';

const CACHE_KEY = 'schemaorg-vocabulary';

/** Cache the vocabulary for 7 days */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Recommended properties for common SEO types
// ---------------------------------------------------------------------------

const RECOMMENDED_PROPERTIES: Record<string, string[]> = {
  Article: [
    'headline',
    'author',
    'datePublished',
    'dateModified',
    'image',
    'publisher',
    'description',
    'mainEntityOfPage',
    'articleBody',
    'wordCount',
  ],
  NewsArticle: [
    'headline',
    'author',
    'datePublished',
    'dateModified',
    'image',
    'publisher',
    'description',
    'mainEntityOfPage',
    'dateline',
  ],
  BlogPosting: [
    'headline',
    'author',
    'datePublished',
    'dateModified',
    'image',
    'publisher',
    'description',
    'mainEntityOfPage',
    'wordCount',
  ],
  Product: [
    'name',
    'description',
    'image',
    'sku',
    'brand',
    'offers',
    'aggregateRating',
    'review',
    'gtin',
    'mpn',
    'color',
    'material',
  ],
  FAQPage: ['mainEntity'],
  Question: ['name', 'acceptedAnswer', 'suggestedAnswer'],
  Answer: ['text'],
  HowTo: [
    'name',
    'description',
    'image',
    'estimatedCost',
    'supply',
    'tool',
    'step',
    'totalTime',
  ],
  HowToStep: ['name', 'text', 'image', 'url'],
  LocalBusiness: [
    'name',
    'address',
    'telephone',
    'openingHoursSpecification',
    'geo',
    'image',
    'url',
    'priceRange',
    'servesCuisine',
    'menu',
    'aggregateRating',
    'review',
  ],
  Restaurant: [
    'name',
    'address',
    'telephone',
    'openingHoursSpecification',
    'geo',
    'image',
    'url',
    'priceRange',
    'servesCuisine',
    'menu',
    'aggregateRating',
    'review',
  ],
  Organization: [
    'name',
    'url',
    'logo',
    'contactPoint',
    'sameAs',
    'address',
    'description',
    'founder',
    'foundingDate',
    'numberOfEmployees',
  ],
  Person: [
    'name',
    'url',
    'image',
    'jobTitle',
    'worksFor',
    'sameAs',
    'email',
    'telephone',
    'address',
    'birthDate',
  ],
  WebSite: ['name', 'url', 'potentialAction', 'description', 'publisher'],
  WebPage: [
    'name',
    'url',
    'description',
    'breadcrumb',
    'mainEntity',
    'datePublished',
    'dateModified',
    'author',
  ],
  BreadcrumbList: ['itemListElement'],
  ListItem: ['item', 'name', 'position'],
  Event: [
    'name',
    'startDate',
    'endDate',
    'location',
    'description',
    'image',
    'organizer',
    'performer',
    'offers',
    'eventStatus',
    'eventAttendanceMode',
  ],
  Recipe: [
    'name',
    'image',
    'author',
    'datePublished',
    'description',
    'prepTime',
    'cookTime',
    'totalTime',
    'recipeYield',
    'recipeCategory',
    'recipeCuisine',
    'nutrition',
    'recipeIngredient',
    'recipeInstructions',
    'aggregateRating',
    'review',
  ],
  Review: [
    'reviewRating',
    'author',
    'reviewBody',
    'datePublished',
    'itemReviewed',
  ],
  AggregateRating: ['ratingValue', 'reviewCount', 'bestRating', 'worstRating'],
  Offer: [
    'price',
    'priceCurrency',
    'availability',
    'url',
    'priceValidUntil',
    'itemCondition',
    'seller',
  ],
  VideoObject: [
    'name',
    'description',
    'thumbnailUrl',
    'uploadDate',
    'duration',
    'contentUrl',
    'embedUrl',
    'interactionStatistic',
  ],
  ImageObject: [
    'contentUrl',
    'url',
    'width',
    'height',
    'caption',
    'author',
    'datePublished',
  ],
  SearchAction: ['target', 'query-input'],
  JobPosting: [
    'title',
    'description',
    'datePosted',
    'validThrough',
    'hiringOrganization',
    'jobLocation',
    'baseSalary',
    'employmentType',
    'applicantLocationRequirements',
    'jobLocationType',
  ],
  Course: [
    'name',
    'description',
    'provider',
    'offers',
    'hasCourseInstance',
    'courseCode',
    'coursePrerequisites',
  ],
  SoftwareApplication: [
    'name',
    'operatingSystem',
    'applicationCategory',
    'offers',
    'aggregateRating',
    'review',
    'screenshot',
    'featureList',
  ],
  Book: [
    'name',
    'author',
    'isbn',
    'numberOfPages',
    'publisher',
    'datePublished',
    'bookFormat',
    'inLanguage',
  ],
  MedicalCondition: [
    'name',
    'alternateName',
    'associatedAnatomy',
    'cause',
    'differentialDiagnosis',
    'drug',
    'epidemiology',
    'possibleTreatment',
    'riskFactor',
    'signOrSymptom',
  ],
  Thing: ['name', 'description', 'url', 'image', 'sameAs', 'identifier'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip common prefixes from a Schema.org ID to produce a clean short name.
 * Handles both "schema:Product" and "https://schema.org/Product" forms.
 */
function stripPrefix(id: string): string {
  if (id.startsWith('schema:')) {
    return id.slice('schema:'.length);
  }
  if (id.startsWith('https://schema.org/')) {
    return id.slice('https://schema.org/'.length);
  }
  if (id.startsWith('http://schema.org/')) {
    return id.slice('http://schema.org/'.length);
  }
  return id;
}

/**
 * Extract a plain string from an rdfs:label or rdfs:comment value which may be
 * a plain string or a JSON-LD language-tagged object.
 */
function extractString(value: string | { '@value': string } | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value['@value'] ?? '';
}

/**
 * Normalise a field that can be a single object or an array of objects into an
 * array of @id strings.
 */
function toIdArray(value: RawRef | RawRef[] | undefined): string[] {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((ref) => stripPrefix(ref['@id']));
}

/**
 * Check whether a raw node's @type includes a given type string.
 */
function hasType(node: RawGraphNode, typeName: string): boolean {
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  return types.includes(typeName);
}

// ---------------------------------------------------------------------------
// VocabularyManager
// ---------------------------------------------------------------------------

export class VocabularyManager {
  private cache: DiskCache;
  private types: Map<string, SchemaTypeNode> = new Map();
  private properties: Map<string, SchemaPropertyNode> = new Map();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(cacheDir?: string) {
    const dir = cacheDir ?? path.join(os.homedir(), '.schemaskill', 'cache');
    this.cache = new DiskCache(dir);
  }

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  /**
   * Ensure the vocabulary has been downloaded, cached, and indexed.
   * Safe to call multiple times -- only the first call does real work.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    await this.initPromise;
    this.initialized = true;
  }

  private async doInitialize(): Promise<void> {
    const vocabulary = await this.loadVocabulary();
    this.buildIndex(vocabulary);
  }

  /**
   * Load the vocabulary JSON from cache or download it fresh.
   */
  private async loadVocabulary(): Promise<SchemaOrgVocabulary> {
    // Try the disk cache first
    const cached = await this.cache.get<SchemaOrgVocabulary>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Download from schema.org
    const response = await fetch(SCHEMA_ORG_URL);
    if (!response.ok) {
      throw new Error(
        `Failed to download Schema.org vocabulary: ${response.status} ${response.statusText}`,
      );
    }

    const vocabulary = (await response.json()) as SchemaOrgVocabulary;

    // Persist to disk cache
    await this.cache.set(CACHE_KEY, vocabulary, CACHE_TTL_MS);

    return vocabulary;
  }

  /**
   * Parse the JSON-LD @graph and build in-memory indexes for types and
   * properties.
   */
  private buildIndex(vocabulary: SchemaOrgVocabulary): void {
    const graph = vocabulary['@graph'];
    if (!Array.isArray(graph)) {
      throw new Error('Invalid Schema.org vocabulary: missing @graph array');
    }

    // First pass: index all types (rdfs:Class)
    for (const node of graph) {
      if (hasType(node, 'rdfs:Class')) {
        const name = stripPrefix(node['@id']);
        // Skip data types and internal entries
        if (name.startsWith('schema:') || name.startsWith('rdfs:')) continue;

        const typeNode: SchemaTypeNode = {
          name,
          id: node['@id'],
          description: extractString(node['rdfs:comment']),
          parentTypes: toIdArray(
            node['rdfs:subClassOf'] as RawRef | RawRef[] | undefined,
          ),
          directPropertyNames: [],
        };
        this.types.set(name, typeNode);
      }
    }

    // Second pass: index all properties (rdf:Property)
    for (const node of graph) {
      if (hasType(node, 'rdf:Property')) {
        // Skip superseded properties
        if (node['schema:supersededBy']) continue;

        const name = stripPrefix(node['@id']);
        const domainTypes = toIdArray(
          node['schema:domainIncludes'] as RawRef | RawRef[] | undefined,
        );
        const rangeTypes = toIdArray(
          node['schema:rangeIncludes'] as RawRef | RawRef[] | undefined,
        );

        const propNode: SchemaPropertyNode = {
          name,
          id: node['@id'],
          description: extractString(node['rdfs:comment']),
          domainTypes,
          rangeTypes,
        };
        this.properties.set(name, propNode);

        // Register this property on each of its domain types
        for (const domainName of domainTypes) {
          const typeNode = this.types.get(domainName);
          if (typeNode) {
            typeNode.directPropertyNames.push(name);
          }
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'VocabularyManager has not been initialized. Call initialize() first.',
      );
    }
  }

  /**
   * Resolve a SchemaPropertyNode into the public SchemaProperty interface.
   */
  private toSchemaProperty(node: SchemaPropertyNode): SchemaProperty {
    const rangeTypes = [...node.rangeTypes];
    return {
      name: node.name,
      description: node.description,
      domainTypes: [...node.domainTypes],
      rangeTypes,
      expectedTypes: rangeTypes,
      id: node.id,
    };
  }

  /**
   * Resolve a SchemaTypeNode into the public SchemaType interface, attaching
   * its *direct* properties.
   */
  private toSchemaType(node: SchemaTypeNode): SchemaType {
    const properties: SchemaProperty[] = node.directPropertyNames
      .map((pName) => this.properties.get(pName))
      .filter((p): p is SchemaPropertyNode => p != null)
      .map((p) => this.toSchemaProperty(p));

    return {
      name: node.name,
      description: node.description,
      parentTypes: [...node.parentTypes],
      properties,
      id: node.id,
    };
  }

  // -----------------------------------------------------------------------
  // Public query API
  // -----------------------------------------------------------------------

  /**
   * Get a schema type by name. Returns null if the type does not exist.
   */
  async getType(typeName: string): Promise<SchemaType | null> {
    await this.initialize();
    const node = this.types.get(typeName);
    if (!node) return null;
    return this.toSchemaType(node);
  }

  /**
   * Get all properties for a type, *including* properties inherited from all
   * ancestor types in the hierarchy. Properties are deduplicated by name.
   */
  async getPropertiesForType(typeName: string): Promise<SchemaProperty[]> {
    await this.initialize();

    const seen = new Set<string>();
    const result: SchemaProperty[] = [];
    const hierarchy = this.resolveHierarchy(typeName);

    for (const ancestorName of hierarchy) {
      const typeNode = this.types.get(ancestorName);
      if (!typeNode) continue;

      for (const propName of typeNode.directPropertyNames) {
        if (seen.has(propName)) continue;
        seen.add(propName);

        const propNode = this.properties.get(propName);
        if (propNode) {
          result.push(this.toSchemaProperty(propNode));
        }
      }
    }

    return result;
  }

  /**
   * Get the full inheritance chain for a type, from the type itself up to
   * Thing. For example: ["Product", "Thing"].
   *
   * Uses breadth-first traversal to handle multiple inheritance.
   */
  async getTypeHierarchy(typeName: string): Promise<string[]> {
    await this.initialize();
    return this.resolveHierarchy(typeName);
  }

  /**
   * Internal hierarchy resolver (synchronous, assumes initialized).
   */
  private resolveHierarchy(typeName: string): string[] {
    this.assertInitialized();

    const result: string[] = [];
    const visited = new Set<string>();
    const queue: string[] = [typeName];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const node = this.types.get(current);
      if (!node) continue;

      result.push(current);

      for (const parent of node.parentTypes) {
        if (!visited.has(parent)) {
          queue.push(parent);
        }
      }
    }

    return result;
  }

  /**
   * Search for types whose name or description matches the query string.
   * Returns up to `limit` results (default 20), ordered by relevance.
   */
  async searchTypes(query: string, limit = 20): Promise<SchemaType[]> {
    await this.initialize();

    const lowerQuery = query.toLowerCase();
    const scored: Array<{ score: number; node: SchemaTypeNode }> = [];

    for (const node of this.types.values()) {
      let score = 0;
      const lowerName = node.name.toLowerCase();
      const lowerDesc = node.description.toLowerCase();

      // Exact name match (highest weight)
      if (lowerName === lowerQuery) {
        score += 100;
      }
      // Name starts with query
      else if (lowerName.startsWith(lowerQuery)) {
        score += 60;
      }
      // Name contains query
      else if (lowerName.includes(lowerQuery)) {
        score += 40;
      }

      // Description contains query
      if (lowerDesc.includes(lowerQuery)) {
        score += 10;
      }

      if (score > 0) {
        scored.push({ score, node });
      }
    }

    // Sort by score descending, then alphabetically by name
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.node.name.localeCompare(b.node.name);
    });

    return scored.slice(0, limit).map(({ node }) => this.toSchemaType(node));
  }

  /**
   * Check whether a given type name exists in the Schema.org vocabulary.
   */
  async isValidType(typeName: string): Promise<boolean> {
    await this.initialize();
    return this.types.has(typeName);
  }

  /**
   * Get the recommended (commonly used) properties for a type.
   *
   * This returns a curated list for well-known SEO types. For types without a
   * curated list it falls back to the first properties from the type's own
   * definition plus inherited "Thing" properties.
   */
  async getRecommendedProperties(
    typeName: string,
  ): Promise<SchemaProperty[]> {
    await this.initialize();

    // Check the curated map first
    const curated = RECOMMENDED_PROPERTIES[typeName];
    if (curated) {
      const result: SchemaProperty[] = [];
      for (const propName of curated) {
        const propNode = this.properties.get(propName);
        if (propNode) {
          result.push(this.toSchemaProperty(propNode));
        }
      }
      return result;
    }

    // Fall back: check parent types for curated recommendations
    const hierarchy = this.resolveHierarchy(typeName);
    for (const ancestor of hierarchy) {
      if (ancestor === typeName) continue; // Already checked above
      const ancestorCurated = RECOMMENDED_PROPERTIES[ancestor];
      if (ancestorCurated) {
        // Merge the type's own direct properties with the ancestor's curated list
        const merged = new Set<string>();
        const typeNode = this.types.get(typeName);
        if (typeNode) {
          for (const p of typeNode.directPropertyNames) {
            merged.add(p);
          }
        }
        for (const p of ancestorCurated) {
          merged.add(p);
        }

        const result: SchemaProperty[] = [];
        for (const propName of merged) {
          const propNode = this.properties.get(propName);
          if (propNode) {
            result.push(this.toSchemaProperty(propNode));
          }
        }
        return result;
      }
    }

    // Last resort: return the type's own direct properties plus Thing's
    const allProps = await this.getPropertiesForType(typeName);
    // Cap at a reasonable number to keep recommendations focused
    return allProps.slice(0, 15);
  }

  // -----------------------------------------------------------------------
  // Synchronous query API (requires prior initialize() call)
  // -----------------------------------------------------------------------

  /**
   * Synchronous check whether a type exists. Must call initialize() first.
   */
  isValidTypeSync(typeName: string): boolean {
    this.assertInitialized();
    return this.types.has(typeName);
  }

  /**
   * Synchronous type lookup. Must call initialize() first.
   */
  getTypeSync(typeName: string): SchemaType | null {
    this.assertInitialized();
    const node = this.types.get(typeName);
    if (!node) return null;
    return this.toSchemaType(node);
  }

  /**
   * Synchronous property lookup including inherited. Must call initialize() first.
   */
  getPropertiesForTypeSync(typeName: string): SchemaProperty[] {
    this.assertInitialized();
    const seen = new Set<string>();
    const result: SchemaProperty[] = [];
    const hierarchy = this.resolveHierarchy(typeName);

    for (const ancestorName of hierarchy) {
      const typeNode = this.types.get(ancestorName);
      if (!typeNode) continue;
      for (const propName of typeNode.directPropertyNames) {
        if (seen.has(propName)) continue;
        seen.add(propName);
        const propNode = this.properties.get(propName);
        if (propNode) {
          result.push(this.toSchemaProperty(propNode));
        }
      }
    }

    return result;
  }

  // -----------------------------------------------------------------------
  // Utility getters (useful for debugging / introspection)
  // -----------------------------------------------------------------------

  /**
   * Returns the total number of indexed types.
   */
  async getTypeCount(): Promise<number> {
    await this.initialize();
    return this.types.size;
  }

  /**
   * Returns the total number of indexed properties.
   */
  async getPropertyCount(): Promise<number> {
    await this.initialize();
    return this.properties.size;
  }

  /**
   * Returns all type names in the vocabulary.
   */
  async getAllTypeNames(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.types.keys()).sort();
  }
}

// ---------------------------------------------------------------------------
// Singleton instance & factory
// ---------------------------------------------------------------------------

let defaultInstance: VocabularyManager | null = null;

/**
 * Create (or reuse) a VocabularyManager instance.
 *
 * When called without arguments, returns a singleton backed by the default
 * cache directory (~/.schemaskill/cache). When a custom cacheDir is provided
 * a new instance is always created.
 */
export function createVocabularyManager(
  cacheDir?: string,
): VocabularyManager {
  if (cacheDir != null) {
    return new VocabularyManager(cacheDir);
  }

  if (!defaultInstance) {
    defaultInstance = new VocabularyManager();
  }

  return defaultInstance;
}
