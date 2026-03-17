import type { PageContent, ExistingSchema } from '../types/crawl.js';
import type { GeneratedSchema, ValidationResult } from '../types/schema.js';
import type { AuditResult, AuditIssue } from '../types/report.js';
import { getAIClient, getDeploymentName } from './client.js';
import { buildGeneratePrompt, buildAuditPrompt, buildFixPrompt } from './prompts.js';

const MAX_FIX_ATTEMPTS = 2;

/** Validator function type — injected by the caller */
export type SchemaValidator = (schema: GeneratedSchema) => Promise<ValidationResult>;

function parseSchemaResponse(content: string, fallbackType: string): GeneratedSchema[] {
  const parsed = JSON.parse(content) as Record<string, unknown>;

  if (Array.isArray(parsed['schemas'])) {
    const rawSchemas = parsed['schemas'] as Record<string, unknown>[];
    return rawSchemas.map((raw) => ({
      '@context': (raw['@context'] as string) ?? 'https://schema.org',
      '@type': (raw['@type'] as string | string[]) ?? fallbackType,
      ...raw,
    }));
  }

  return [{
    '@context': (parsed['@context'] as string) ?? 'https://schema.org',
    '@type': (parsed['@type'] as string | string[]) ?? fallbackType,
    ...parsed,
  }];
}

function getSchemaType(schema: GeneratedSchema): string {
  return Array.isArray(schema['@type']) ? schema['@type'].join(', ') : schema['@type'];
}

/**
 * Generate schemas, validate them, and auto-fix if there are errors.
 * Retries up to MAX_FIX_ATTEMPTS times by feeding errors back to the AI.
 */
export async function generateSchema(
  pageContent: PageContent,
  existingSchemas: ExistingSchema[],
  detectedType: string,
  vocabularyInfo: string,
  validator?: SchemaValidator,
): Promise<GeneratedSchema[]> {
  const client = getAIClient();
  const deploymentName = getDeploymentName();

  // --- Step 1: Initial generation ---
  const [systemMessage, userMessage] = buildGeneratePrompt({
    pageContent,
    detectedType,
    vocabularyInfo,
    existingSchemas,
  });

  let schemas: GeneratedSchema[];

  try {
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: systemMessage.role, content: systemMessage.content },
        { role: userMessage.role, content: userMessage.content },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('AI returned an empty response.');
    schemas = parseSchemaResponse(content, detectedType);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
    throw error instanceof Error
      ? new Error(`Schema generation failed: ${error.message}`)
      : new Error('Schema generation failed due to an unknown error.');
  }

  // --- Step 2: If no validator provided, return as-is ---
  if (!validator) return schemas;

  // --- Step 3: Validate + auto-fix loop ---
  for (let attempt = 0; attempt < MAX_FIX_ATTEMPTS; attempt++) {
    const validationErrors: { schemaType: string; errors: string[]; warnings: string[] }[] = [];
    let hasErrors = false;

    for (const schema of schemas) {
      const result = await validator(schema);
      if (!result.valid) {
        hasErrors = true;
        validationErrors.push({
          schemaType: getSchemaType(schema),
          errors: result.errors.map((e) => e.message),
          warnings: result.warnings.map((w) => w.message),
        });
      } else if (result.warnings.length > 0) {
        validationErrors.push({
          schemaType: getSchemaType(schema),
          errors: [],
          warnings: result.warnings.map((w) => w.message),
        });
      }
    }

    if (!hasErrors) return schemas;

    // --- Fix attempt ---
    console.log(`[schemaSkill] Validation errors found, auto-fixing (attempt ${attempt + 1}/${MAX_FIX_ATTEMPTS})...`);

    const [fixSystem, fixUser] = buildFixPrompt({
      originalSchemas: schemas,
      validationErrors,
    });

    try {
      const fixResponse = await client.chat.completions.create({
        model: deploymentName,
        messages: [
          { role: fixSystem.role, content: fixSystem.content },
          { role: fixUser.role, content: fixUser.content },
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 4096,
      });

      const fixContent = fixResponse.choices[0]?.message?.content;
      if (fixContent) {
        schemas = parseSchemaResponse(fixContent, detectedType);
      }
    } catch {
      // If fix attempt fails, return what we have
      break;
    }
  }

  return schemas;
}

interface RawAuditResponse {
  pageType?: string;
  existingSchemaAnalysis?: {
    type: string;
    valid: boolean;
    issues: string[];
  }[];
  missingSchemas?: string[];
  suggestedSchema?: Record<string, unknown>;
  priority?: 'high' | 'medium' | 'low';
  score?: number;
  issues?: {
    severity: 'error' | 'warning' | 'info';
    message: string;
    recommendation: string;
  }[];
}

export async function auditSchema(
  pageContent: PageContent,
  existingSchemas: ExistingSchema[],
  vocabularyInfo: string,
): Promise<AuditResult> {
  const [systemMessage, userMessage] = buildAuditPrompt({
    pageContent,
    existingSchemas,
    vocabularyInfo,
  });

  const client = getAIClient();
  const deploymentName = getDeploymentName();

  try {
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: systemMessage.role, content: systemMessage.content },
        { role: userMessage.role, content: userMessage.content },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned an empty response.');
    }

    const raw = JSON.parse(content) as RawAuditResponse;

    // Map existing schemas to the AuditResult format, merging AI analysis
    const existingSchemasSummary = existingSchemas.map((schema, index) => {
      const analysis = raw.existingSchemaAnalysis?.[index];
      return {
        type: schema.type,
        format: schema.format,
        valid: analysis?.valid ?? true,
      };
    });

    // If the AI returned additional analysis entries beyond what we have,
    // include those too (e.g., for nested schemas it detected)
    if (
      raw.existingSchemaAnalysis &&
      raw.existingSchemaAnalysis.length > existingSchemas.length
    ) {
      for (
        let i = existingSchemas.length;
        i < raw.existingSchemaAnalysis.length;
        i++
      ) {
        const analysis = raw.existingSchemaAnalysis[i]!;
        existingSchemasSummary.push({
          type: analysis.type,
          format: 'json-ld',
          valid: analysis.valid,
        });
      }
    }

    const issues: AuditIssue[] = (raw.issues ?? []).map((issue) => ({
      severity: issue.severity,
      message: issue.message,
      recommendation: issue.recommendation,
    }));

    // Collect additional issues from existingSchemaAnalysis
    if (raw.existingSchemaAnalysis) {
      for (const analysis of raw.existingSchemaAnalysis) {
        for (const issueText of analysis.issues) {
          // Avoid duplicating issues already in the top-level issues array
          const alreadyPresent = issues.some((i) => i.message === issueText);
          if (!alreadyPresent) {
            issues.push({
              severity: analysis.valid ? 'warning' : 'error',
              message: issueText,
              recommendation: `Fix the issue in the ${analysis.type} schema.`,
            });
          }
        }
      }
    }

    const auditResult: AuditResult = {
      url: pageContent.url,
      pageType: raw.pageType ?? 'WebPage',
      existingSchemas: existingSchemasSummary,
      missingSchemas: raw.missingSchemas ?? [],
      issues,
      suggestedSchema: raw.suggestedSchema ?? null,
      priority: raw.priority ?? 'medium',
      score: typeof raw.score === 'number' ? Math.max(0, Math.min(100, raw.score)) : 0,
    };

    return auditResult;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse AI audit response as JSON: ${error.message}`,
      );
    }
    if (error instanceof Error) {
      throw new Error(`Schema audit failed: ${error.message}`);
    }
    throw new Error('Schema audit failed due to an unknown error.');
  }
}
