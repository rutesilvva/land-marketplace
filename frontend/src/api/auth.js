const KEY = 'terra-credentials';

export function credentials() { return localStorage.getItem(KEY); }
export function authorizationHeaders() { const value = credentials(); return value ? { Authorization: `Basic ${value}` } : {}; }
export function saveCredentials(email, password) { localStorage.setItem(KEY, btoa(`${email}:${password}`)); }
export function clearCredentials() { localStorage.removeItem(KEY); }

async function authRequest(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...authorizationHeaders(), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || 'Authentication failed.'); }
  return response.json();
}
export function currentUser() { return authRequest('/api/auth/me'); }
export async function login(email, password) { saveCredentials(email, password); try { return await currentUser(); } catch (error) { clearCredentials(); throw error; } }
export async function register(values) {
  await authRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(values) });
  return login(values.email, values.password);
}
