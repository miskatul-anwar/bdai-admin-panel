/**
 * Utility functions for parsing, formatting, and sorting event dates and times.
 */

export function parseEventDate(dateStr?: string): number {
  if (!dateStr) return 0;

  // 1. Direct ISO check or valid Date string
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) {
    return direct.getTime();
  }

  // 2. Clean ordinal suffixes: 1st, 2nd, 3rd, 4th, 29th -> 1, 2, 3, 4, 29
  let clean = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

  // 3. Clean time format like 2.00PM -> 2:00 PM
  clean = clean.replace(/(\d+)\.(\d+)\s*(AM|PM)/gi, '$1:$2 $3');

  // 4. Replace middle dot separator
  clean = clean.replace(/·/g, ' ');

  const cleanedDate = new Date(clean);
  if (!isNaN(cleanedDate.getTime())) {
    return cleanedDate.getTime();
  }

  // 5. Fallback: extract Day Month Year via regex
  const match = clean.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const month = months[match[2].toLowerCase().slice(0, 3)];
    if (month !== undefined) {
      return new Date(parseInt(match[3], 10), month, parseInt(match[1], 10)).getTime();
    }
  }

  return 0;
}

export function getEventTimestamp(event: {
  date_iso?: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
}): number {
  if (event.date_iso) {
    const t = parseEventDate(event.date_iso);
    if (t > 0) return t;
  }
  if (event.date) {
    const t = parseEventDate(event.date);
    if (t > 0) return t;
  }
  if (event.createdAt || event.created_at) {
    const t = parseEventDate(event.createdAt || event.created_at);
    if (t > 0) return t;
  }
  return 0;
}

export function extractDateAndTime(dateStr?: string, isoStr?: string): { date: string; time: string } {
  // If ISO string exists (e.g. 2026-07-29 or 2026-07-29T14:00)
  if (isoStr) {
    const parts = isoStr.split('T');
    return {
      date: parts[0] || '',
      time: parts[1] ? parts[1].slice(0, 5) : '',
    };
  }

  if (!dateStr) return { date: '', time: '' };

  let time = '';
  // Check for time pattern e.g. 2.00PM, 14:00, 2:00 PM
  const timeMatch = dateStr.match(/(\d{1,2})[.:](\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const ampm = timeMatch[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    time = `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // Clean date
  let clean = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
  clean = clean.replace(/(\d+)\.(\d+)\s*(AM|PM)/gi, '');
  clean = clean.replace(/·/g, ' ').trim();

  // Check YYYY-MM-DD
  const isoMatch = clean.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return { date: `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`, time };
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { date: `${y}-${m}-${day}`, time };
  }

  // Regex day month year
  const match = clean.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    };
    const month = months[match[2].toLowerCase().slice(0, 3)];
    if (month) {
      return { date: `${match[3]}-${month}-${String(match[1]).padStart(2, '0')}`, time };
    }
  }

  return { date: '', time };
}

export function formatEventDisplayDate(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;

  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;

  const dateObj = new Date(y, m - 1, d);
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (!timeStr) return formattedDate;

  const timeParts = timeStr.split(':');
  const hoursRaw = parseInt(timeParts[0], 10);
  const mins = parseInt(timeParts[1], 10);
  if (isNaN(hoursRaw) || isNaN(mins)) return formattedDate;

  const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
  const hours = hoursRaw % 12 || 12;
  const formattedTime = `${hours}:${String(mins).padStart(2, '0')} ${ampm}`;

  return `${formattedTime} · ${formattedDate}`;
}
