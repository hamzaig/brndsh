import { useState, useEffect } from 'react';
import type { ChatTurn, SessionInfo, FileViewTarget } from './types';
import { startSession, askQuestion } from './api';
import SessionSetup from './components/SessionSetup';
import ChatPanel from './components/ChatPanel';
import AuditPanel from './components/AuditPanel';
import FileViewer from './components/FileViewer';
import InvestigationLogPanel from './components/InvestigationLog';

type RightTab = 'audit' | 'log' | 'file';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [session, setSession] = useState<SessionInfo | null>(() => load('ci_session', null));
  const [turns, setTurns] = useState<ChatTurn[]>(() => load('ci_turns', []));
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number>(() => {
    const saved = load<ChatTurn[]>('ci_turns', []);
    return saved.length > 0 ? saved.length - 1 : 0;
  });
  const [rightTab, setRightTab] = useState<RightTab>('audit');
  const [fileTarget, setFileTarget] = useState<FileViewTarget | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (session) localStorage.setItem('ci_session', JSON.stringify(session));
    else localStorage.removeItem('ci_session');
  }, [session]);

  useEffect(() => {
    localStorage.setItem('ci_turns', JSON.stringify(turns));
  }, [turns]);

  async function handleStart(repoUrl: string, branch: string) {
    setSetupError(null);
    setLoading(true);
    try {
      const res = await startSession(repoUrl, branch);
      setSession({
        sessionId: res.sessionId,
        owner: res.owner,
        repo: res.repo,
        branch: res.branch,
        fileCount: res.fileCount,
      });
      setTurns([]);
      setSelectedTurnIndex(0);
      setFileTarget(null);
      setSelectedCitation(null);
    } catch (err) {
      setSetupError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk(question: string): Promise<void> {
    if (!session) return;
    setLoading(true);
    try {
      const response = await askQuestion(session.sessionId, question);
      const newTurns = [...turns, { question, response }];
      setTurns(newTurns);
      setSelectedTurnIndex(newTurns.length - 1);
      setRightTab('audit');
      setFileTarget(null);
      setSelectedCitation(null);
    } finally {
      setLoading(false);
    }
    // errors propagate to ChatPanel so it can show them and restore the input
  }

  function handleSelectFile(target: FileViewTarget) {
    setFileTarget(target);
    setSelectedCitation(target.citation);
    setRightTab('file');
  }

  function handleReset() {
    localStorage.removeItem('ci_session');
    localStorage.removeItem('ci_turns');
    setSession(null);
    setTurns([]);
    setSelectedTurnIndex(0);
    setFileTarget(null);
    setSelectedCitation(null);
    setSetupError(null);
  }

  const selectedTurn = turns[selectedTurnIndex] ?? null;

  if (!session) {
    return <SessionSetup onStart={handleStart} loading={loading} error={setupError} />;
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* LEFT: Chat panel — explicit bounded height so inner flex/scroll works */}
      <div style={{ width: '42%', flexShrink: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ChatPanel
          session={session}
          turns={turns}
          selectedTurnIndex={selectedTurnIndex}
          onSelectTurn={setSelectedTurnIndex}
          onAsk={handleAsk}
          loading={loading}
          onReset={handleReset}
        />
      </div>

      {/* RIGHT: Audit + File viewer */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-base)',
      }}>
        {/* Right panel tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-panel)',
          flexShrink: 0,
        }}>
          {([
            { key: 'audit' as const, label: 'Audit Results', icon: '🔎' },
            { key: 'log' as const, label: 'Investigation Log', icon: '📋' },
            { key: 'file' as const, label: 'File Viewer', icon: '📄' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setRightTab(tab.key)}
              style={{
                background: rightTab === tab.key ? 'var(--accent-dim)' : 'transparent',
                border: rightTab === tab.key ? '1px solid var(--accent)44' : '1px solid transparent',
                borderRadius: 'var(--radius)',
                padding: '5px 12px',
                color: rightTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: rightTab === tab.key ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.key === 'file' && fileTarget && (
                <span style={{
                  background: 'var(--accent)',
                  borderRadius: '10px',
                  width: '6px',
                  height: '6px',
                  flexShrink: 0,
                }} />
              )}
            </button>
          ))}

          {/* Turn indicator */}
          {selectedTurn && (
            <div style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}>
              Turn #{selectedTurn.response.turnNumber}
            </div>
          )}
        </div>

        {/* Right panel content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {rightTab === 'audit' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }}>
              {!selectedTurn ? (
                <EmptyRight
                  icon="🔎"
                  title="Audit results will appear here"
                  text="After you ask a question, a second AI pass checks every citation against the actual source code."
                />
              ) : !selectedTurn.response.audit ? (
                <div style={{ color: 'var(--yellow)', fontSize: '13px' }}>Audit data unavailable for this turn.</div>
              ) : (
                <AuditPanel
                  audit={selectedTurn.response.audit}
                  onSelectFile={handleSelectFile}
                  selectedCitation={selectedCitation}
                />
              )}
            </div>
          )}

          {rightTab === 'log' && (
            <div style={{ flex: 1, overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {!selectedTurn ? (
                <EmptyRight
                  icon="📋"
                  title="Investigation log"
                  text="Established facts, contradictions, and open questions accumulate across turns."
                />
              ) : (
                <InvestigationLogPanel
                  log={selectedTurn.response.log}
                  onSelectFile={handleSelectFile}
                />
              )}
            </div>
          )}

          {rightTab === 'file' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <FileViewer target={fileTarget} session={session} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyRight({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '10px',
      color: 'var(--text-muted)',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{ fontSize: '36px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</div>
      <div style={{ fontSize: '12px', maxWidth: '280px', lineHeight: '1.6' }}>{text}</div>
    </div>
  );
}
