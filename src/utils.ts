import type { ParsedCitation } from './types';

// Parses "src/foo/bar.ts:L10-L25", "src/foo.ts:L42", or "src/foo.ts"
export function parseCitation(raw: string): ParsedCitation {
  const lineRangeMatch = raw.match(/^(.+):L(\d+)-L(\d+)$/);
  if (lineRangeMatch) {
    return {
      path: lineRangeMatch[1],
      startLine: parseInt(lineRangeMatch[2], 10),
      endLine: parseInt(lineRangeMatch[3], 10),
      raw,
    };
  }
  const singleLineMatch = raw.match(/^(.+):L(\d+)$/);
  if (singleLineMatch) {
    const line = parseInt(singleLineMatch[2], 10);
    return { path: singleLineMatch[1], startLine: line, endLine: line, raw };
  }
  return { path: raw, startLine: null, endLine: null, raw };
}

export function verdictColor(verdict: string): string {
  if (verdict === 'TRUST') return '#3fb950';
  if (verdict === 'VERIFY') return '#d29922';
  return '#f85149';
}

export function levelColor(level: string): string {
  if (level === 'HIGH') return '#3fb950';
  if (level === 'MEDIUM') return '#d29922';
  return '#f85149';
}

export function riskColor(risk: string): string {
  if (risk === 'LOW') return '#3fb950';
  if (risk === 'MEDIUM') return '#d29922';
  return '#f85149';
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
