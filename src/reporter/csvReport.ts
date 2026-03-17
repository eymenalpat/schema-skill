import { stringify } from 'csv-stringify/sync';
import type { AuditResult } from '../types/report.js';

function deriveAction(result: AuditResult): string {
  if (result.existingSchemas.length === 0) {
    return `${result.pageType} için JSON-LD schema markup ekleyin.`;
  }

  const errorIssues = result.issues.filter((i) => i.severity === 'error');
  if (errorIssues.length > 0) {
    return errorIssues[0]!.recommendation;
  }

  const warningIssues = result.issues.filter((i) => i.severity === 'warning');
  if (warningIssues.length > 0) {
    return warningIssues[0]!.recommendation;
  }

  if (result.missingSchemas.length > 0) {
    return `Eksik schema tipleri ekleyin: ${result.missingSchemas.join(', ')}`;
  }

  if (result.score >= 90) {
    return 'Schema markup yeterli, düzenli kontrol yapın.';
  }

  return 'Schema markup iyileştirmelerini değerlendirin.';
}

function priorityLabel(priority: 'high' | 'medium' | 'low'): string {
  const labels: Record<string, string> = {
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };
  return labels[priority] ?? priority;
}

export async function generateCsvReport(
  results: AuditResult[],
): Promise<string> {
  const rows = results.map((result) => ({
    URL: result.url,
    'Sayfa Tipi': result.pageType,
    'Mevcut Schema': result.existingSchemas.length > 0
      ? result.existingSchemas.map((s) => s.type).join(', ')
      : 'Yok',
    'Eksik Schema': result.missingSchemas.length > 0
      ? result.missingSchemas.join(', ')
      : 'Yok',
    'Sorun Sayısı': result.issues.length,
    Puan: result.score,
    'Öncelik': priorityLabel(result.priority),
    Aksiyon: deriveAction(result),
  }));

  return stringify(rows, {
    header: true,
    columns: [
      { key: 'URL', header: 'URL' },
      { key: 'Sayfa Tipi', header: 'Sayfa Tipi' },
      { key: 'Mevcut Schema', header: 'Mevcut Schema' },
      { key: 'Eksik Schema', header: 'Eksik Schema' },
      { key: 'Sorun Sayısı', header: 'Sorun Sayısı' },
      { key: 'Puan', header: 'Puan' },
      { key: 'Öncelik', header: 'Öncelik' },
      { key: 'Aksiyon', header: 'Aksiyon' },
    ],
  });
}
