import React, { useEffect, useRef, useState } from 'react';
import type { ChatTurn, SessionInfo } from '../types';
import { VerdictBadge, ConfidenceBadge } from './ConfidenceBadge';
import { timeAgo } from '../utils';

interface Props {
  session: SessionInfo;
  turns: ChatTurn[];
  selectedTurnIndex: number;
  onSelectTurn: (index: number) => void;
  onAsk: (question: string) => Promise<void>;
  loading: boolean;
  onReset: () => void;
}

export default function ChatPanel({
  session,
  turns,
  selectedTurnIndex,
  onSelectTurn,
  onAsk,
  loading,
  onReset,
}: Props) {
  const [question, setQuestion] = useState('');
  const [askError, setAskError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns.length, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setAskError(null);
    try {
      await onAsk(q);
      setQuestion(''); // only clear after success
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      const msg = (err as Error).message;
      const isSessionGone = msg.includes('404') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('session');
      setAskError(
        isSessionGone
          ? 'Session expired (backend restarted). Click "New session" to start fresh.'
          : `Error: ${msg}`,
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Session header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}>
            {session.owner}/{session.repo}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            branch: {session.branch} · {session.fileCount} files indexed
          </div>
        </div>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          New session
        </button>
      </div>

      {/* Turn history sidebar + chat split */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column' }}>
        {/* Turn history */}
        {turns.length > 0 && (
          <div style={{
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 16px',
              minWidth: 'max-content',
            }}>
              {turns.map((t, i) => {
                const isSelected = i === selectedTurnIndex;
                const verdict = t.response.audit?.verdict;
                return (
                  <button
                    key={i}
                    onClick={() => onSelectTurn(i)}
                    style={{
                      background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '5px 12px',
                      color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>#{t.response.turnNumber}</span>
                    <span style={{
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {t.question.length > 30 ? t.question.substring(0, 30) + '…' : t.question}
                    </span>
                    {verdict && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: verdict === 'TRUST' ? 'var(--green)' : verdict === 'VERIFY' ? 'var(--yellow)' : 'var(--red)',
                        flexShrink: 0,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }}>
          {turns.length === 0 && !loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '40px' }}>💬</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Ask your first question</div>
              <div style={{ fontSize: '12px', textAlign: 'center', maxWidth: '240px' }}>
                Ask about architecture, specific files, patterns, security issues, or anything in the codebase.
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '8px',
                width: '100%',
              }}>
                {[
                  'What is the overall architecture?',
                  'What tools does the AI agent use?',
                  'Are there any security concerns?',
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setQuestion(suggestion)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '8px 12px',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn, i) => (
            <div
              key={i}
              onClick={() => onSelectTurn(i)}
              style={{
                marginBottom: '20px',
                cursor: 'pointer',
                opacity: selectedTurnIndex === i || turns.length === 1 ? 1 : 0.7,
                transition: 'opacity 0.15s',
              }}
            >
              {/* Question bubble */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '8px',
              }}>
                <div style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)44',
                  borderRadius: '12px 12px 3px 12px',
                  padding: '10px 14px',
                  maxWidth: '85%',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                }}>
                  {turn.question}
                </div>
              </div>

              {/* Answer bubble */}
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  flexShrink: 0,
                }}>
                  🔍
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px 12px 12px 12px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {turn.response.answer}
                  </div>

                  {/* Audit summary */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {turn.response.audit && (
                      <>
                        <VerdictBadge verdict={turn.response.audit.verdict} size="sm" />
                        <ConfidenceBadge confidence={turn.response.audit.confidence} />
                      </>
                    )}
                    {turn.response.toolCallLog.length > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {turn.response.toolCallLog.length} tool call{turn.response.toolCallLog.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {timeAgo(turn.response.audit?.auditedAt ?? new Date().toISOString())}
                    </span>
                  </div>

                  {/* Tool calls */}
                  {turn.response.toolCallLog.length > 0 && (
                    <ToolCallList calls={turn.response.toolCallLog} />
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0,
              }}>
                🔍
              </div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '3px 12px 12px 12px',
                padding: '14px 16px',
              }}>
                <LoadingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Question input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-panel)',
            flexShrink: 0,
          }}
        >
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '8px 12px',
          }}>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={e => {
                setQuestion(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the codebase… (Enter to send, Shift+Enter for newline)"
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                resize: 'none',
                lineHeight: '1.5',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              style={{
                background: loading || !question.trim() ? 'var(--border)' : 'var(--accent)',
                color: loading || !question.trim() ? 'var(--text-muted)' : '#fff',
                borderRadius: '5px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'background 0.15s',
                flexShrink: 0,
                cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Ask
            </button>
          </div>
          {askError && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius)',
              fontSize: '12px',
              color: 'var(--red)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '8px',
            }}>
              <span>{askError}</span>
              <button
                onClick={() => setAskError(null)}
                style={{ background: 'transparent', color: 'var(--red)', fontWeight: 700, flexShrink: 0, fontSize: '14px' }}
              >
                ×
              </button>
            </div>
          )}
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
            Turn {turns.length + 1} · session {session.sessionId.substring(0, 8)}
          </div>
        </form>
      </div>
    </div>
  );
}

function ToolCallList({ calls }: { calls: import('../types').ToolCallLog[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 0',
        }}
      >
        <span style={{ transition: 'transform 0.15s', display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
        Tool calls ({calls.length})
      </button>
      {expanded && (
        <div style={{
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {calls.map((call, i) => (
            <div key={i} style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '8px 10px',
              fontSize: '11px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                marginBottom: '4px',
                fontWeight: 600,
              }}>
                {call.toolName}({Object.entries(call.input).map(([k, v]) => `${k}: "${String(v).substring(0, 40)}"`).join(', ')})
              </div>
              <div style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {call.outputPreview}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--text-muted)',
            animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
