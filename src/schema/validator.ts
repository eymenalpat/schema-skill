import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  SchemaProperty,
  SchemaType,
} from '../types/schema.js';

/**
 * Interface for the VocabularyManager dependency.
 * Provides schema.org vocabulary lookup capabilities.
 */
export interface VocabularyManager {
  isValidType(name: string): boolean;
  getType(name: string): SchemaType | null;
  getPropertiesForType(name: string): SchemaProperty[];
}

/**
 * Google-recommended required properties per schema.org type.
 * These represent the minimum properties needed for rich results.
 */
const GOOGLE_REQUIRED_PROPERTIES: Record<string, string[]> = {
  Article: ['headline', 'author', 'datePublished', 'image'],
  NewsArticle: ['headline', 'author', 'datePublished', 'image'],
  BlogPosting: ['headline', 'author', 'datePublished', 'image'],
  Product: ['name', 'image', 'description'],
  LocalBusiness: ['name', 'address', 'telephone'],
  Organization: ['name', 'url', 'logo'],
  Person: ['name'],
  Event: ['name', 'startDate', 'location'],
  Recipe: ['name', 'image', 'author', 'description'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  BreadcrumbList: ['itemListElement'],
  WebSite: ['name', 'url'],
  WebPage: ['name', 'url'],
  VideoObject: ['name', 'description', 'thumbnailUrl', 'uploadDate'],
  Review: ['itemReviewed', 'author', 'reviewRating'],
  Course: ['name', 'description', 'provider'],
  JobPosting: ['title', 'description', 'datePosted', 'hiringOrganization'],
  SoftwareApplication: ['name', 'operatingSystem'],
};

/** URL-like property names that should contain valid URLs */
const URL_PROPERTIES = new Set([
  'url',
  'image',
  'logo',
  'thumbnailUrl',
  'contentUrl',
  'sameAs',
  'mainEntityOfPage',
]);

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateContext(
  schema: Record<string, unknown>,
  errors: ValidationError[],
): void {
  const context = schema['@context'];

  if (!context) {
    errors.push({
      path: '@context',
      message: '@context alanı eksik. "https://schema.org" olmalıdır.',
    });
    return;
  }

  const contextStr = typeof context === 'string' ? context : '';

  const validContexts = [
    'https://schema.org',
    'https://schema.org/',
    'http://schema.org',
    'http://schema.org/',
  ];

  if (!validContexts.includes(contextStr)) {
    errors.push({
      path: '@context',
      message: `@context değeri "${String(context)}" geçersiz. "https://schema.org" olmalıdır.`,
    });
  }
}

function validateType(
  schema: Record<string, unknown>,
  vocabularyManager: VocabularyManager,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): string | null {
  const type = schema['@type'];

  if (!type) {
    errors.push({
      path: '@type',
      message: '@type alanı eksik.',
    });
    return null;
  }

  // Handle single type string
  if (typeof type === 'string') {
    if (!vocabularyManager.isValidType(type)) {
      errors.push({
        path: '@type',
        message: `"${type}" geçerli bir schema.org tipi değil.`,
      });
      return null;
    }
    return type;
  }

  // Handle array of types
  if (Array.isArray(type)) {
    if (type.length === 0) {
      errors.push({
        path: '@type',
        message: '@type dizisi boş olamaz.',
      });
      return null;
    }

    let primaryType: string | null = null;
    for (const t of type) {
      if (typeof t !== 'string') {
        errors.push({
          path: '@type',
          message: '@type dizisindeki tüm değerler string olmalıdır.',
        });
        continue;
      }
      if (!vocabularyManager.isValidType(t)) {
        warnings.push({
          path: '@type',
          message: `"${t}" geçerli bir schema.org tipi olmayabilir.`,
          suggestion: `schema.org üzerinde "${t}" tipini kontrol edin.`,
        });
      } else if (!primaryType) {
        primaryType = t;
      }
    }
    return primaryType;
  }

  errors.push({
    path: '@type',
    message: '@type alanı string veya string dizisi olmalıdır.',
  });
  return null;
}

function validateProperties(
  schema: Record<string, unknown>,
  typeName: string,
  vocabularyManager: VocabularyManager,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void {
  const validProperties = vocabularyManager.getPropertiesForType(typeName);
  const validPropertyNames = new Set(validProperties.map((p) => p.name));

  // Check that all user-provided properties are valid for this type
  for (const key of Object.keys(schema)) {
    // Skip JSON-LD keywords
    if (key.startsWith('@')) continue;

    if (validPropertyNames.size > 0 && !validPropertyNames.has(key)) {
      warnings.push({
        path: key,
        message: `"${key}" özelliği "${typeName}" tipi için tanımlı değil.`,
        suggestion: `schema.org/${typeName} sayfasından geçerli özellikleri kontrol edin.`,
      });
    }
  }
}

function validateRequiredProperties(
  schema: Record<string, unknown>,
  typeName: string,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void {
  const required = GOOGLE_REQUIRED_PROPERTIES[typeName];
  if (!required) return;

  for (const prop of required) {
    const value = schema[prop];

    if (value === undefined || value === null) {
      errors.push({
        path: prop,
        message: `"${prop}" özelliği "${typeName}" tipi için Google tarafından zorunlu kabul edilir.`,
        property: prop,
      });
    } else if (typeof value === 'string' && value.trim().length === 0) {
      warnings.push({
        path: prop,
        message: `"${prop}" özelliği boş bir string değer içeriyor.`,
        suggestion: `"${prop}" için anlamlı bir değer sağlayın.`,
      });
    }
  }
}

function validateValueTypes(
  schema: Record<string, unknown>,
  typeName: string,
  vocabularyManager: VocabularyManager,
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void {
  const properties = vocabularyManager.getPropertiesForType(typeName);
  const propertyMap = new Map(properties.map((p) => [p.name, p]));

  for (const [key, value] of Object.entries(schema)) {
    if (key.startsWith('@')) continue;
    if (value === undefined || value === null) continue;

    const propDef = propertyMap.get(key);

    // Validate URL fields
    if (URL_PROPERTIES.has(key)) {
      validateUrlProperty(key, value, warnings);
    }

    // Validate against expected types from vocabulary
    if (propDef && propDef.rangeTypes.length > 0) {
      validatePropertyValue(key, value, propDef.rangeTypes, warnings);
    }
  }
}

function validateUrlProperty(
  key: string,
  value: unknown,
  warnings: ValidationWarning[],
): void {
  if (typeof value === 'string') {
    if (!isValidUrl(value)) {
      warnings.push({
        path: key,
        message: `"${key}" alanındaki değer geçerli bir URL formatında değil: "${value}"`,
        suggestion: `"${key}" için "https://" ile başlayan geçerli bir URL kullanın.`,
      });
    }
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (typeof item === 'string' && !isValidUrl(item)) {
        warnings.push({
          path: `${key}[${i}]`,
          message: `"${key}[${i}]" alanındaki değer geçerli bir URL formatında değil: "${item}"`,
          suggestion: `Geçerli bir URL kullanın.`,
        });
      }
      // Nested objects with @type (like ImageObject) are acceptable
    }
  }
  // If it's an object (e.g., ImageObject), that's also valid, no warning needed
}

function validatePropertyValue(
  key: string,
  value: unknown,
  expectedTypes: string[],
  warnings: ValidationWarning[],
): void {
  // Determine the actual value type
  const hasTextExpected = expectedTypes.some((t) =>
    ['Text', 'URL', 'Date', 'DateTime', 'Time'].includes(t),
  );
  const hasNumberExpected = expectedTypes.some((t) =>
    ['Number', 'Integer', 'Float'].includes(t),
  );
  const hasBooleanExpected = expectedTypes.includes('Boolean');
  const hasObjectExpected = expectedTypes.some(
    (t) =>
      !['Text', 'URL', 'Date', 'DateTime', 'Time', 'Number', 'Integer', 'Float', 'Boolean'].includes(t),
  );

  if (typeof value === 'string') {
    // Strings can match Text, URL, Date, etc. - generally fine
    if (!hasTextExpected && hasNumberExpected && !hasObjectExpected) {
      // Only numbers expected but got string
      const num = Number(value);
      if (isNaN(num)) {
        warnings.push({
          path: key,
          message: `"${key}" için sayısal değer bekleniyordu, string verildi: "${value}"`,
          suggestion: `"${key}" için sayısal bir değer kullanın.`,
        });
      }
    }
  } else if (typeof value === 'number') {
    if (!hasNumberExpected && hasTextExpected && !hasObjectExpected) {
      // Not a problem per se, but warn if only text is expected
      warnings.push({
        path: key,
        message: `"${key}" için metin değer bekleniyordu, sayı verildi.`,
        suggestion: `"${key}" değerini string formatına dönüştürmeyi düşünün.`,
      });
    }
  } else if (typeof value === 'boolean') {
    if (!hasBooleanExpected) {
      warnings.push({
        path: key,
        message: `"${key}" için boolean değer beklenmiyor.`,
        suggestion: `"${key}" için beklenen tiplerden birini kullanın: ${expectedTypes.join(', ')}`,
      });
    }
  } else if (isPlainObject(value)) {
    if (!hasObjectExpected && !hasTextExpected) {
      warnings.push({
        path: key,
        message: `"${key}" için nesne değer beklenmiyor.`,
        suggestion: `"${key}" için beklenen tiplerden birini kullanın: ${expectedTypes.join(', ')}`,
      });
    }
  }
}

export async function validateJsonLd(
  schema: Record<string, unknown>,
  vocabularyManager: VocabularyManager,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Validate @context
  validateContext(schema, errors);

  // 2. Validate @type
  const typeName = validateType(schema, vocabularyManager, errors, warnings);

  // If we have a valid type, run property-level validations
  if (typeName) {
    // 3. Validate properties are valid for the type
    validateProperties(schema, typeName, vocabularyManager, errors, warnings);

    // 4. Validate required properties (Google guidelines)
    validateRequiredProperties(schema, typeName, errors, warnings);

    // 5. Validate value types
    validateValueTypes(schema, typeName, vocabularyManager, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
