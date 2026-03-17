/**
 * Schema.org type definition with its properties, description, and parent types.
 */
export interface SchemaType {
  /** The name of the schema type (e.g., "Product", "Article") */
  name: string;
  /** Human-readable description from rdfs:comment */
  description: string;
  /** Direct parent type names (from rdfs:subClassOf) */
  parentTypes: string[];
  /** Properties directly associated with this type */
  properties: SchemaProperty[];
  /** The full URL identifier (e.g., "schema:Product") */
  id: string;
}

/**
 * Schema.org property definition.
 */
export interface SchemaProperty {
  /** The name of the property (e.g., "name", "description") */
  name: string;
  /** Human-readable description from rdfs:comment */
  description: string;
  /** Types this property belongs to (domain) */
  domainTypes: string[];
  /** Expected value types for this property (range) */
  rangeTypes: string[];
  /** Expected value types (alias for rangeTypes, used by the validator) */
  expectedTypes: string[];
  /** The full URL identifier */
  id: string;
}

/**
 * Generated JSON-LD structured data.
 */
export interface GeneratedSchema {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
}

/**
 * Result containing multiple generated schemas for a single page.
 */
export interface MultiSchemaResult {
  schemas: GeneratedSchema[];
  pageType: string;
  url: string;
}

/**
 * Result of validating a generated schema.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  property?: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}
