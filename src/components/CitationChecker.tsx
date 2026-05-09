import type { CitationCheck, FileViewTarget } from '../types';
import { parseCitation } from '../utils';

interface Props {
  checks: CitationCheck[];
  onSelectFile: (target: FileViewTarget) => void;
  selectedCitation: string | null;
}

export default function CitationChecker({ checks, onSelectFile, selectedCitation }: Props) {
  if (checks.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '8px 0' }}>
        No citations found in this response.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {checks.map((check, i) => {
        const parsed = parseCitation(check.citation);
        const isSelected = selectedCitation === check.citation;
        const statusColor = !check.exists ? 'var(--red)'
          : !check.supports_claim ? 'var(--yellow)'
          : 'var(--green)';
        const statusIcon = !check.exists ? '✗' : !check.supports_claim ? '⚠' : '✓';
        const statusLabel = !check.exists ? 'Not found' : !check.supports_claim ? 'Doesn\'t support claim' : 'Verified';

        return (
          <div
            key={i}
            onClick={() => onSelectFile({ path: parsed.path, startLine: parsed.startLine, endLine: parsed.endLine, citation: check.citation })}
            style={{
              background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '10px 12px',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                  wordBreak: 'break-all',
                  marginBottom: '4px',
                }}>
                  {check.citation}
                </div>
                {check.note && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {check.note}
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '3px',
                flexShrink: 0,
              }}>
                <span style={{
                  color: statusColor,
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  {statusIcon}
                </span>
                <span style={{ color: statusColor, fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {parsed.startLine !== null && (
              <div style={{
                marginTop: '6px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>📄</span>
                <span>{parsed.path}</span>
                <span style={{ color: 'var(--accent)' }}>
                  L{parsed.startLine}{parsed.endLine !== parsed.startLine ? `–L${parsed.endLine}` : ''}
                </span>
                <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '10px' }}>
                  View →
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
