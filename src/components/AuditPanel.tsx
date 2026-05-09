import type { AuditResult, FileViewTarget } from '../types';
import { VerdictBadge, ConfidenceBadge, RiskBadge } from './ConfidenceBadge';
import CitationChecker from './CitationChecker';

interface Props {
  audit: AuditResult;
  onSelectFile: (target: FileViewTarget) => void;
  selectedCitation: string | null;
}

export default function AuditPanel({ audit, onSelectFile, selectedCitation }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Verdict + metrics row */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px',
        }}>
          <VerdictBadge verdict={audit.verdict} size="lg" />
          <RiskBadge risk={audit.risk_level} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ConfidenceBadge confidence={audit.confidence} />

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Metric
              label="Citations found"
              value={String(audit.citationsFound)}
              color={audit.citationsFound > 0 ? 'var(--green)' : 'var(--yellow)'}
            />
            <Metric
              label="Citations valid"
              value={audit.citation_valid ? 'Yes' : 'No'}
              color={audit.citation_valid ? 'var(--green)' : 'var(--red)'}
            />
            <Metric
              label="Reasoning sound"
              value={audit.reasoning_sound ? 'Yes' : 'No'}
              color={audit.reasoning_sound ? 'var(--green)' : 'var(--red)'}
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      {audit.flags.length > 0 && (
        <div>
          <SectionHeader label="Flags" count={audit.flags.length} color="var(--yellow)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {audit.flags.map((flag, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 12px',
                background: 'var(--yellow-dim)',
                border: '1px solid #3a2e00',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                color: 'var(--yellow)',
              }}>
                <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠</span>
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citation checker */}
      <div>
        <SectionHeader
          label="Citation Checker"
          count={audit.citation_checks.length}
          color="var(--accent)"
        />
        <div style={{ marginTop: '8px' }}>
          <CitationChecker
            checks={audit.citation_checks}
            onSelectFile={onSelectFile}
            selectedCitation={selectedCitation}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {label}
      {count > 0 && (
        <span style={{
          background: color + '22',
          border: `1px solid ${color}55`,
          borderRadius: '10px',
          padding: '0px 7px',
          fontSize: '11px',
          color,
          fontWeight: 700,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}
