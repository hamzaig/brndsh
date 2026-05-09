import React, { useEffect, useRef, useState } from 'react';
import type { FileViewTarget, SessionInfo } from '../types';
import { fetchFileContent } from '../api';

interface Props {
  target: FileViewTarget | null;
  session: SessionInfo;
}

interface FileCache {
  [key: string]: { content: string; lineCount: number };
}

const cache: FileCache = {};

export default function FileViewer({ target, session }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target) return;
    const cacheKey = `${session.owner}/${session.repo}/${target.path}@${session.branch}`;

    if (cache[cacheKey]) {
      setContent(cache[cacheKey].content);
      setLineCount(cache[cacheKey].lineCount);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetchFileContent(session.owner, session.repo, target.path, session.branch)
      .then(data => {
        cache[cacheKey] = { content: data.content, lineCount: data.lineCount };
        setContent(data.content);
        setLineCount(data.lineCount);
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [target?.path, session.owner, session.repo, session.branch]);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [content, target?.startLine]);

  if (!target) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        gap: '8px',
      }}>
        <div style={{ fontSize: '32px' }}>📄</div>
        <div style={{ fontSize: '13px' }}>Click a citation to view the source file</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Loading {target.path}…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '16px',
        background: 'var(--red-dim)',
        border: '1px solid var(--red)',
        borderRadius: 'var(--radius)',
        color: 'var(--red)',
        fontSize: '13px',
      }}>
        {error}
      </div>
    );
  }

  const lines = (content ?? '').split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* File header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--accent)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {target.citation}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', flexShrink: 0, marginLeft: '8px' }}>
          {lineCount} lines
        </span>
      </div>

      {/* Line count summary */}
      {target.startLine !== null && (
        <div style={{
          padding: '5px 12px',
          background: 'var(--accent-dim)',
          borderBottom: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--accent)',
          flexShrink: 0,
        }}>
          Highlighted: L{target.startLine}
          {target.endLine !== null && target.endLine !== target.startLine ? `–L${target.endLine}` : ''}
          {' '}· {target.endLine !== null ? target.endLine - (target.startLine ?? 0) + 1 : 1} line
          {((target.endLine ?? target.startLine ?? 0) - (target.startLine ?? 0)) > 0 ? 's' : ''}
        </div>
      )}

      {/* Code content */}
      <div style={{
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        lineHeight: '1.6',
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted =
                target.startLine !== null &&
                lineNum >= target.startLine &&
                lineNum <= (target.endLine ?? target.startLine);

              return (
                <tr
                  key={lineNum}
                  ref={isHighlighted && lineNum === target.startLine ? highlightRef as React.RefObject<HTMLTableRowElement> : undefined}
                  style={{
                    background: isHighlighted ? 'rgba(88,166,255,0.12)' : 'transparent',
                    borderLeft: isHighlighted ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  <td style={{
                    padding: '0 12px 0 10px',
                    color: isHighlighted ? 'var(--accent)' : 'var(--text-muted)',
                    textAlign: 'right',
                    userSelect: 'none',
                    minWidth: '40px',
                    width: '40px',
                    fontWeight: isHighlighted ? 600 : 400,
                  }}>
                    {lineNum}
                  </td>
                  <td style={{
                    padding: '0 16px 0 8px',
                    color: isHighlighted ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'pre',
                    fontWeight: isHighlighted ? 500 : 400,
                  }}>
                    {line || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
