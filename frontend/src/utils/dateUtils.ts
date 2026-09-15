import { format, isValid } from 'date-fns';

/**
 * Parses an ISO date/datetime string from the API safely into a JS Date object in local time.
 * If the API string is a datetime without timezone offset (e.g. "2026-09-15T03:17:00" or "2026-09-15 03:17:00"),
 * it treats it as UTC by normalizing to ISO with 'Z' so the browser automatically converts it to local timezone (GMT+7).
 */
export const parseApiDate = (dateStr?: string | Date | null): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isValid(dateStr) ? dateStr : null;

  let str = String(dateStr).trim();
  if (!str) return null;

  // Pure date "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // Datetime string
  if (str.includes('T') || str.includes(' ')) {
    str = str.replace(' ', 'T');
    if (!str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
      str += 'Z';
    }
  }

  try {
    const d = new Date(str);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

/**
 * Formats a date string or Date object into a readable date (e.g., "15/09/2026").
 */
export const formatDate = (dateStr?: string | Date | null, pattern = 'dd/MM/yyyy'): string => {
  const d = parseApiDate(dateStr);
  if (!d) return '—';
  return format(d, pattern);
};

/**
 * Formats a date string or Date object into a readable datetime in local time (e.g., "10:17 15/09/2026").
 */
export const formatDateTime = (dateStr?: string | Date | null, pattern = 'HH:mm dd/MM/yyyy'): string => {
  const d = parseApiDate(dateStr);
  if (!d) return '—';
  return format(d, pattern);
};

/**
 * Formats a short time + date in local time (e.g., "10:17 15/09").
 */
export const formatShortDateTime = (dateStr?: string | Date | null, pattern = 'HH:mm dd/MM'): string => {
  const d = parseApiDate(dateStr);
  if (!d) return '—';
  return format(d, pattern);
};
