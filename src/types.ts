export interface ToolCallLog {
  toolName: string;
  input: Record<string, unknown>;
  outputPreview: string;
}

export interface CitationCheck {
  citation: string;
  exists: boolean;
  supports_claim: boolean;
  note?: string;
}

export type Verdict = 'TRUST' | 'VERIFY' | 'DOUBT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuditResult {
  citation_checks: CitationCheck[];
  citation_valid: boolean;
  reasoning_sound: boolean;
  risk_level: RiskLevel;
  confidence: ConfidenceLevel;
  flags: string[];
  verdict: Verdict;
  citationsFound: number;
  auditedAt: string;
}

export interface TurnRecord {
  turnNumber: number;
  question: string;
  answer: string;
  toolsUsed: string[];
  filesAccessed: string[];
  auditVerdict: Verdict | null;
  auditConfidence: ConfidenceLevel | null;
  timestamp: string;
}

export interface EstablishedFact {
  claim: string;
  citation: string;
  confirmedInTurn: number;
}

export interface Contradiction {
  detectedInTurn: number;
  citation: string;
  previousFact: string;
  newClaim: string;
  description: string;
}

export interface InvestigationLog {
  turns: TurnRecord[];
  establishedFacts: EstablishedFact[];
  contradictions: Contradiction[];
  openQuestions: string[];
}

export interface InvestigatorResponse {
  sessionId: string;
  turnNumber: number;
  answer: string;
  toolCallLog: ToolCallLog[];
  audit: AuditResult;
  log: InvestigationLog;
}

export interface StartSessionResponse {
  sessionId: string;
  owner: string;
  repo: string;
  branch: string;
  fileCount: number;
  message: string;
}

export interface ChatTurn {
  question: string;
  response: InvestigatorResponse;
}

export interface SessionInfo {
  sessionId: string;
  owner: string;
  repo: string;
  branch: string;
  fileCount: number;
}

export interface ParsedCitation {
  path: string;
  startLine: number | null;
  endLine: number | null;
  raw: string;
}

export interface FileViewTarget {
  path: string;
  startLine: number | null;
  endLine: number | null;
  citation: string;
}
