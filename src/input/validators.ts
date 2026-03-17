import { existsSync, accessSync, constants } from 'node:fs';
import { extname } from 'node:path';

export function validateUrl(url: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  if (!url || typeof url !== 'string') {
    return { valid: false, normalized: '', error: 'URL boş olamaz.' };
  }

  let trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, normalized: '', error: 'URL boş olamaz.' };
  }

  // Reject obviously invalid URLs
  if (trimmed.includes(' ') && !trimmed.includes('%20')) {
    return {
      valid: false,
      normalized: '',
      error: 'URL boşluk karakteri içeremez.',
    };
  }

  // Add protocol if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith('//')) {
      trimmed = `https:${trimmed}`;
    } else {
      trimmed = `https://${trimmed}`;
    }
  }

  // Validate with URL constructor
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      normalized: '',
      error: `Geçersiz URL formatı: ${url}`,
    };
  }

  // Must be http or https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      normalized: '',
      error: 'URL yalnızca http veya https protokolü kullanabilir.',
    };
  }

  // Must have a valid hostname (at least one dot or localhost)
  const hostname = parsed.hostname;
  if (
    !hostname ||
    (hostname !== 'localhost' && !hostname.includes('.'))
  ) {
    return {
      valid: false,
      normalized: '',
      error: 'URL geçerli bir alan adı içermelidir.',
    };
  }

  // Reject if hostname is just a dot or starts/ends with dots
  if (
    hostname.startsWith('.') ||
    hostname.endsWith('.') ||
    hostname.includes('..')
  ) {
    return {
      valid: false,
      normalized: '',
      error: 'URL geçersiz bir alan adı içeriyor.',
    };
  }

  return { valid: true, normalized: parsed.href };
}

export function validateCsvFile(filePath: string): {
  valid: boolean;
  error?: string;
} {
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'Dosya yolu boş olamaz.' };
  }

  const trimmed = filePath.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Dosya yolu boş olamaz.' };
  }

  // Check extension
  const ext = extname(trimmed).toLowerCase();
  if (ext !== '.csv') {
    return {
      valid: false,
      error: `Dosya uzantısı .csv olmalıdır. Mevcut uzantı: ${ext || '(yok)'}`,
    };
  }

  // Check file exists
  if (!existsSync(trimmed)) {
    return {
      valid: false,
      error: `Dosya bulunamadı: ${trimmed}`,
    };
  }

  // Check file is readable
  try {
    accessSync(trimmed, constants.R_OK);
  } catch {
    return {
      valid: false,
      error: `Dosya okunamıyor: ${trimmed}`,
    };
  }

  return { valid: true };
}
