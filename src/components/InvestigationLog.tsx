import { useState } from 'react';
import type { InvestigationLog as ILog, FileViewTarget } from '../types';
import { parseCitation } from '../utils';

interface Props {
  log: ILog;
  onSelectFile: (target: FileViewTarget) => void;
}

export default function InvestigationLogPanel({ log, onSelectFile }: Props) {
  const [section, setSection] = useState<'facts' | 'contradictions' | 'questions'>('facts');

  const tabs = [
    { key: 'facts' as const, label: 'Facts', count: log.establishedFacts.length, color: 'var(--green)' },
    { key: 'contradictions' as const, label: 'Contradictions', count: log.contradictions.length, color: 'var(--red)' },
    { key: 'questions' as const, label: 'Open Questions', count: log.openQuestions.length, color: 'var(--yellow)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '12px',
        flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            style={{
              background: section === tab.key ? tab.color + '22' : 'var(--bg-card)',
              border: `1px solid ${section === tab.key ? tab.color + '55' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '5px 10px',
              color: section === tab.key ? tab.color : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: section === tab.key ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: tab.color + '33',
                borderRadius: '10px',
                padding: '0 6px',
                fontSize: '10px',
                fontWeight: 700,
                color: tab.color,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {section === 'facts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {log.establishedFacts.length === 0 && (
              <EmptyState icon="📋" text="No established facts yet. Facts are recorded when the auditor gives a TRUST verdict." />
            )}
            {log.establishedFacts.map((fact, i) => {
              const parsed = parseCitation(fact.citation);
              return (
                <div key={i} style={{
                  background: 'var(--green-dim)',
                  border: '1px solid #1a5a1f',
                  borderRadius: 'var(--radius)',
                  padding: '10px 12px',
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.5' }}>
                    {fact.claim}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <button
                      onClick={() => onSelectFile({ path: parsed.path, startLine: parsed.startLine, endLine: parsed.endLine, citation: fact.citation })}
                      style={{
                        background: 'transparent',
                        color: 'var(--green)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {fact.citation}
                    </button>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      confirmed turn #{fact.confirmedInTurn}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {section === 'contradictions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {log.contradictions.length === 0 && (
              <EmptyState icon="✓" text="No contradictions detected across turns." />
            )}
            {log.contradictions.map((c, i) => (
              <div key={i} style={{
                background: 'var(--red-dim)',
                border: '1px solid #5a1a1a',
                borderRadius: 'var(--radius)',
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 600, marginBottom: '6px' }}>
                  Detected in turn #{c.detectedInTurn} · {c.citation}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Previous:</strong> {c.previousFact}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>New claim:</strong> {c.newClaim}
                </div>
                {c.description && (
                  <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '6px', fontStyle: 'italic' }}>
                    {c.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {section === 'questions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {log.openQuestions.length === 0 && (
              <EmptyState icon="❓" text="No open questions flagged yet." />
            )}
            {log.openQuestions.map((q, i) => (
              <div key={i} style={{
                background: 'var(--yellow-dim)',
                border: '1px solid #3a2e0055',
                borderRadius: 'var(--radius)',
                padding: '9px 12px',
                fontSize: '12px',
                color: 'var(--yellow)',
                display: 'flex',
                gap: '8px',
              }}>
                <span>❓</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '24px',
      color: 'var(--text-muted)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '28px' }}>{icon}</div>
      <div style={{ fontSize: '12px' }}>{text}</div>
    </div>
  );
}
