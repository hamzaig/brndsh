import type { Verdict, ConfidenceLevel, RiskLevel } from '../types';
import { verdictColor, levelColor, riskColor } from '../utils';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
}

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const color = verdictColor(verdict);
  const icons: Record<Verdict, string> = { TRUST: '✓', VERIFY: '⚠', DOUBT: '✗' };
  const fontSize = size === 'lg' ? '15px' : size === 'md' ? '13px' : '11px';
  const padding = size === 'lg' ? '6px 14px' : '3px 10px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: `${color}22`,
      border: `1px solid ${color}55`,
      borderRadius: '20px',
      color,
      fontSize,
      fontWeight: 700,
      padding,
      letterSpacing: '0.04em',
    }}>
      <span>{icons[verdict]}</span>
      {verdict}
    </span>
  );
}

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  label?: string;
}

export function ConfidenceBadge({ confidence, label = 'Confidence' }: ConfidenceBadgeProps) {
  const color = levelColor(confidence);
  const bars = confidence === 'HIGH' ? 3 : confidence === 'MEDIUM' ? 2 : 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{label}</span>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3].map(n => (
          <div
            key={n}
            style={{
              width: '8px',
              height: '16px',
              borderRadius: '2px',
              background: n <= bars ? color : 'var(--border)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ color, fontSize: '12px', fontWeight: 600 }}>{confidence}</span>
    </div>
  );
}

interface RiskBadgeProps {
  risk: RiskLevel;
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const color = riskColor(risk);
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color,
      fontWeight: 600,
    }}>
      <span style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
      }} />
      {risk} RISK
    </span>
  );
}
