import React, { useState } from 'react';

interface Props {
  onStart: (repoUrl: string, branch: string) => void;
  loading: boolean;
  error: string | null;
}

export default function SessionSetup({ onStart, loading, error }: Props) {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (repoUrl.trim()) onStart(repoUrl.trim(), branch.trim() || 'main');
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 48px',
        width: '100%',
        maxWidth: '520px',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>🔍</span>
            Codebase Investigator
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Paste a GitHub repository URL to start an investigation session.
            Ask questions about the code — every answer is citation-checked by a second AI auditor.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>GitHub Repository URL</label>
          <input
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            disabled={loading}
            style={inputStyle}
            autoFocus
          />

          <label style={{ ...labelStyle, marginTop: '16px' }}>Branch</label>
          <input
            type="text"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            placeholder="main"
            disabled={loading}
            style={inputStyle}
          />

          {error && (
            <div style={{
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              color: 'var(--red)',
              fontSize: '13px',
              marginTop: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !repoUrl.trim()}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '11px 20px',
              background: loading || !repoUrl.trim() ? 'var(--bg-hover)' : 'var(--accent)',
              color: loading || !repoUrl.trim() ? 'var(--text-muted)' : '#fff',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background 0.15s',
              cursor: loading || !repoUrl.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Indexing repository…' : 'Start Investigation'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          textAlign: 'center',
        }}>
          {[
            { icon: '🛠', label: 'Tool-use agent', sub: 'Explores code with fetch, search, list' },
            { icon: '🔎', label: 'Citation audit', sub: 'Every claim verified against source' },
            { icon: '📋', label: 'Investigation log', sub: 'Facts, contradictions, open questions' },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{ color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{label}</div>
              <div style={{ fontSize: '11px' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-base)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '9px 12px',
  color: 'var(--text-primary)',
  fontSize: '14px',
};
