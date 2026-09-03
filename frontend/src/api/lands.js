import { authorizationHeaders } from './auth.js';

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...authorizationHeaders(), ...options.headers } });
  if (!response.ok) {
    let message = 'The request could not be completed.';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // Keep the safe fallback for non-JSON server responses.
    }
    throw new Error(message);
  }
  return response.json();
}

export function getLands() {
  return request('/api/lands');
}

export function createLand(land) {
  return request('/api/lands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(land),
  });
}

export function searchLands({ longitude, latitude, radiusMeters }) {
  const params = new URLSearchParams({ longitude, latitude, radiusMeters });
  return request(`/api/lands/search?${params}`);
}

export function reserveLand(id) { return request(`/api/lands/${id}/reservation`, { method: 'POST' }); }
export function cancelLandReservation(id) { return request(`/api/lands/${id}/reservation`, { method: 'DELETE' }); }
