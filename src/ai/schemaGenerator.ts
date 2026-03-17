import type { PageContent, ExistingSchema } from '../types/crawl.js';
import type { GeneratedSchema } from '../types/schema.js';
import type { AuditResult, AuditIssue } from '../types/report.js';
import { getAIClient, getDeploymentName } from './client.js';
import { buildGeneratePrompt, buildAuditPrompt } from './prompts.js';

export async function generateSchema(
  pageContent: PageContent,
  existingSchemas: ExistingSchema[],
  detectedType: string,
  vocabularyInfo: string,
): Promise<GeneratedSchema[]> {
  const [systemMessage, userMessage] = buildGeneratePrompt({
    pageContent,
    detectedType,
    vocabularyInfo,
    existingSchemas,
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

    const parsed = JSON.parse(content) as Record<string, unknown>;

    // Handle new multi-schema format: { "schemas": [...] }
    if (Array.isArray(parsed['schemas'])) {
      const rawSchemas = parsed['schemas'] as Record<string, unknown>[];
      return rawSchemas.map((raw) => ({
        '@context': (raw['@context'] as string) ?? 'https://schema.org',
        '@type': (raw['@type'] as string | string[]) ?? detectedType,
        ...raw,
      }));
    }

    // Backward compatibility: handle old single-object format
    const schema: GeneratedSchema = {
      '@context': (parsed['@context'] as string) ?? 'https://schema.org',
      '@type': (parsed['@type'] as string | string[]) ?? detectedType,
      ...parsed,
    };

    return [schema];
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse AI response as JSON: ${error.message}`,
      );
    }
    if (error instanceof Error) {
      throw new Error(`Schema generation failed: ${error.message}`);
    }
    throw new Error('Schema generation failed due to an unknown error.');
  }
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
