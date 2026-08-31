import { authorizationHeaders } from './auth.js';

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...authorizationHeaders(), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || 'The proposal request failed.'); }
  return response.json();
}
export const createProposal = (proposal) => request('/api/proposals', { method: 'POST', body: JSON.stringify(proposal) });
export const getMyProposals = () => request('/api/proposals/mine');
export const getReceivedProposals = () => request('/api/proposals/received');
export const updateProposal = (id, status) => request(`/api/proposals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
