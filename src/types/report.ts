export interface AuditResult {
  url: string;
  pageType: string;
  existingSchemas: { type: string; format: string; valid: boolean }[];
  missingSchemas: string[];
  issues: AuditIssue[];
  suggestedSchema: Record<string, unknown> | null;
  priority: 'high' | 'medium' | 'low';
  score: number; // 0-100
}

export interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

export interface AuditSummary {
  totalUrls: number;
  crawled: number;
  errors: number;
  withSchema: number;
  withoutSchema: number;
  averageScore: number;
  byPriority: { high: number; medium: number; low: number };
}
