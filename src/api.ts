import type { StartSessionResponse, InvestigatorResponse } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function startSession(repoUrl: string, branch: string): Promise<StartSessionResponse> {
  return request<StartSessionResponse>(`${BASE}/investigate/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl, branch }),
  });
}

export function askQuestion(sessionId: string, question: string): Promise<InvestigatorResponse> {
  return request<InvestigatorResponse>(`${BASE}/investigate/sessions/${sessionId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
}

export function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string,
): Promise<{ path: string; lineCount: number; content: string }> {
  const params = new URLSearchParams({ owner, repo, path, branch });
  return request(`${BASE}/github/file?${params}`);
}

export function deleteSession(sessionId: string): Promise<void> {
  return fetch(`${BASE}/investigate/sessions/${sessionId}`, { method: 'DELETE' }).then(() => undefined);
}
