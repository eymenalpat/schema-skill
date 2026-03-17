import { parse } from 'csv-parse/sync';
import { readFileSync, existsSync } from 'node:fs';

export interface CsvInputRow {
  url: string;
  pageType?: string;
  priority?: string;
  notes?: string;
}

interface RawCsvRow {
  [key: string]: string | undefined;
}

function findColumn(
  headers: string[],
  candidates: string[],
): string | undefined {
  for (const candidate of candidates) {
    const found = headers.find(
      (h) => h.toLowerCase().trim() === candidate.toLowerCase(),
    );
    if (found) return found;
  }
  return undefined;
}

export async function parseCsvInput(filePath: string): Promise<CsvInputRow[]> {
  if (!existsSync(filePath)) {
    throw new Error(`Dosya bulunamadı: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');

  if (content.trim().length === 0) {
    throw new Error(`Dosya boş: ${filePath}`);
  }

  const rawRows: RawCsvRow[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (rawRows.length === 0) {
    throw new Error('CSV dosyasında veri satırı bulunamadı.');
  }

  const headers = Object.keys(rawRows[0]!);

  const urlCol = findColumn(headers, ['url', 'URL', 'Url', 'link', 'Link']);
  if (!urlCol) {
    throw new Error(
      'CSV dosyasında "url" sütunu bulunamadı. Beklenen sütun adları: url, URL, link',
    );
  }

  const pageTypeCol = findColumn(headers, [
    'page_type',
    'pageType',
    'pagetype',
    'type',
    'sayfa_tipi',
  ]);
  const priorityCol = findColumn(headers, [
    'priority',
    'öncelik',
    'oncelik',
  ]);
  const notesCol = findColumn(headers, [
    'notes',
    'note',
    'notlar',
    'açıklama',
  ]);

  const results: CsvInputRow[] = [];

  for (const row of rawRows) {
    const url = row[urlCol]?.trim();

    // Skip rows with empty URL
    if (!url) {
      continue;
    }

    const csvRow: CsvInputRow = { url };

    if (pageTypeCol && row[pageTypeCol]?.trim()) {
      csvRow.pageType = row[pageTypeCol]!.trim();
    }

    if (priorityCol && row[priorityCol]?.trim()) {
      csvRow.priority = row[priorityCol]!.trim();
    }

    if (notesCol && row[notesCol]?.trim()) {
      csvRow.notes = row[notesCol]!.trim();
    }

    results.push(csvRow);
  }

  if (results.length === 0) {
    throw new Error(
      'CSV dosyasında geçerli URL içeren satır bulunamadı.',
    );
  }

  return results;
}
