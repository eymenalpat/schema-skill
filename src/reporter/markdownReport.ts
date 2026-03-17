import type { AuditResult, AuditSummary } from '../types/report.js';

const severityIcon: Record<string, string> = {
  error: '🔴',
  warning: '🟡',
  info: '🔵',
};

function formatDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function priorityLabel(priority: 'high' | 'medium' | 'low'): string {
  const labels: Record<string, string> = {
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };
  return labels[priority] ?? priority;
}

function buildExecutiveSummary(results: AuditResult[], summary: AuditSummary): string[] {
  const lines: string[] = [];
  lines.push('## Yönetici Özeti');
  lines.push('');

  if (summary.withoutSchema > 0) {
    lines.push(
      `- **${summary.withoutSchema}** sayfada hiç schema markup bulunmuyor.`,
    );
  }
  if (summary.withSchema > 0) {
    lines.push(
      `- **${summary.withSchema}** sayfada mevcut schema markup tespit edildi.`,
    );
  }

  const errorCount = results.reduce(
    (acc, r) => acc + r.issues.filter((i) => i.severity === 'error').length,
    0,
  );
  const warningCount = results.reduce(
    (acc, r) => acc + r.issues.filter((i) => i.severity === 'warning').length,
    0,
  );

  if (errorCount > 0) {
    lines.push(`- Toplam **${errorCount}** kritik hata tespit edildi.`);
  }
  if (warningCount > 0) {
    lines.push(`- Toplam **${warningCount}** uyarı tespit edildi.`);
  }

  lines.push(`- Ortalama puan: **${summary.averageScore.toFixed(1)}/100**`);
  lines.push('');

  return lines;
}

function buildPriorityBreakdown(summary: AuditSummary): string[] {
  const lines: string[] = [];
  lines.push('## Öncelik Dağılımı');
  lines.push('');
  lines.push('| Öncelik | Sayfa Sayısı |');
  lines.push('|---------|-------------|');
  lines.push(`| Yüksek | ${summary.byPriority.high} |`);
  lines.push(`| Orta | ${summary.byPriority.medium} |`);
  lines.push(`| Düşük | ${summary.byPriority.low} |`);
  lines.push('');
  return lines;
}

function buildUrlSection(result: AuditResult): string[] {
  const lines: string[] = [];

  lines.push(`### ${result.url}`);
  lines.push('');
  lines.push(`**Sayfa Tipi:** ${result.pageType}`);
  lines.push(`**Öncelik:** ${priorityLabel(result.priority)}`);
  lines.push(`**Puan:** ${result.score}/100`);
  lines.push('');

  // Current schemas
  if (result.existingSchemas.length > 0) {
    lines.push('#### Mevcut Schema Markup');
    lines.push('');
    lines.push('| Tip | Format | Geçerli |');
    lines.push('|-----|--------|---------|');
    for (const schema of result.existingSchemas) {
      const validLabel = schema.valid ? 'Evet' : 'Hayır';
      lines.push(`| ${schema.type} | ${schema.format} | ${validLabel} |`);
    }
    lines.push('');
  } else {
    lines.push('#### Mevcut Schema Markup');
    lines.push('');
    lines.push('Schema markup bulunamadı.');
    lines.push('');
  }

  // Missing schemas
  if (result.missingSchemas.length > 0) {
    lines.push('#### Eksik Schema Tipleri');
    lines.push('');
    for (const missing of result.missingSchemas) {
      lines.push(`- ${missing}`);
    }
    lines.push('');
  }

  // Issues
  if (result.issues.length > 0) {
    lines.push('#### Tespit Edilen Sorunlar');
    lines.push('');
    for (const issue of result.issues) {
      const icon = severityIcon[issue.severity] ?? '🔵';
      lines.push(`- ${icon} **${issue.message}**`);
      lines.push(`  - Öneri: ${issue.recommendation}`);
    }
    lines.push('');
  }

  // Suggested JSON-LD
  if (result.suggestedSchema) {
    lines.push('#### Önerilen JSON-LD');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(result.suggestedSchema, null, 2));
    lines.push('```');
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  return lines;
}

function buildRecommendations(results: AuditResult[]): string[] {
  const lines: string[] = [];
  lines.push('## Öneriler');
  lines.push('');

  // Collect unique recommendations from high-priority issues
  const highPriorityResults = results.filter((r) => r.priority === 'high');
  const mediumPriorityResults = results.filter((r) => r.priority === 'medium');

  if (highPriorityResults.length > 0) {
    lines.push('### Yüksek Öncelikli Aksiyonlar');
    lines.push('');
    const seen = new Set<string>();
    for (const result of highPriorityResults) {
      for (const issue of result.issues) {
        if (issue.severity === 'error' && !seen.has(issue.recommendation)) {
          seen.add(issue.recommendation);
          lines.push(`1. ${issue.recommendation}`);
        }
      }
    }
    if (seen.size === 0) {
      for (const result of highPriorityResults) {
        if (!seen.has(result.url)) {
          seen.add(result.url);
          lines.push(
            `1. **${result.url}** sayfası için schema markup ekleyin (Puan: ${result.score}/100).`,
          );
        }
      }
    }
    lines.push('');
  }

  if (mediumPriorityResults.length > 0) {
    lines.push('### Orta Öncelikli Aksiyonlar');
    lines.push('');
    const seen = new Set<string>();
    for (const result of mediumPriorityResults) {
      for (const issue of result.issues) {
        if (
          (issue.severity === 'error' || issue.severity === 'warning') &&
          !seen.has(issue.recommendation)
        ) {
          seen.add(issue.recommendation);
          lines.push(`1. ${issue.recommendation}`);
        }
      }
    }
    if (seen.size === 0) {
      for (const result of mediumPriorityResults) {
        if (!seen.has(result.url)) {
          seen.add(result.url);
          lines.push(
            `1. **${result.url}** sayfası için schema markup iyileştirin (Puan: ${result.score}/100).`,
          );
        }
      }
    }
    lines.push('');
  }

  lines.push('### Genel Öneriler');
  lines.push('');
  lines.push('1. Tüm sayfalarda JSON-LD formatında schema markup kullanın.');
  lines.push(
    '2. Google Rich Results Test aracı ile schema markup doğrulaması yapın.',
  );
  lines.push(
    '3. Schema markup değişikliklerini Google Search Console üzerinden takip edin.',
  );
  lines.push('');

  return lines;
}

export function generateMarkdownReport(
  results: AuditResult[],
  summary: AuditSummary,
): string {
  const lines: string[] = [];

  // Title
  lines.push('# Schema Markup Denetim Raporu');
  lines.push('');

  // Date and summary stats
  lines.push(`**Tarih:** ${formatDate()}`);
  lines.push(`**Toplam URL:** ${summary.totalUrls}`);
  lines.push(`**Taranan:** ${summary.crawled}`);
  lines.push(`**Hata:** ${summary.errors}`);
  lines.push(`**Schema Mevcut:** ${summary.withSchema}`);
  lines.push(`**Schema Eksik:** ${summary.withoutSchema}`);
  lines.push(`**Ortalama Puan:** ${summary.averageScore.toFixed(1)}/100`);
  lines.push('');

  // Executive summary
  lines.push(...buildExecutiveSummary(results, summary));

  // Priority breakdown
  lines.push(...buildPriorityBreakdown(summary));

  // Detailed per-URL sections
  lines.push('## Detaylı Sonuçlar');
  lines.push('');

  for (const result of results) {
    lines.push(...buildUrlSection(result));
  }

  // Recommendations
  lines.push(...buildRecommendations(results));

  return lines.join('\n');
}
