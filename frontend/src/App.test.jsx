import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLand, getLands, searchLands } from './api/lands.js';
import App from './App.jsx';
import { currentUser, login, register } from './api/auth.js';

vi.mock('./api/lands.js', () => ({ getLands: vi.fn(), createLand: vi.fn(), searchLands: vi.fn() }));
vi.mock('./api/auth.js', () => ({ currentUser: vi.fn(), login: vi.fn(), register: vi.fn(), clearCredentials: vi.fn() }));
vi.mock('./components/LandMap.jsx', () => ({
  default: ({ lands, drawMode, onPolygonDrawn, onCircleDrawn, onLandSelect, onClosePopup }) => (
    <div data-testid="map">
      <span>{lands.length} map features</span>
      <span>{drawMode ? `${drawMode} active` : 'browse active'}</span>
      <button onClick={() => onPolygonDrawn({ type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] })}>Finish polygon</button>
      <button onClick={() => onCircleDrawn({ longitude: -38.54, latitude: -3.73, radiusMeters: 1200 })}>Finish circle</button>
      <button onClick={() => onLandSelect(lands[0])}>Select land</button>
      <button onClick={onClosePopup}>Close popup</button>
    </div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLands.mockResolvedValue([]);
    searchLands.mockResolvedValue([]);
    currentUser.mockResolvedValue({ id: 'owner-id', name: 'Owner', email: 'owner@example.com' });
  });

  it('loads listings and starts polygon drawing', async () => {
    getLands.mockResolvedValue([{ id: 'one', price: 100 }]);
    render(<App />);
    expect(await screen.findByText('1 active listing')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /list your land/i }));
    expect(screen.getByText('polygon active')).toBeVisible();
  });

  it('publishes the form created from a drawn polygon', async () => {
    const created = { id: 'new-land', price: 275000, description: 'Green parcel', contact: 'owner@example.com' };
    createLand.mockResolvedValue(created);
    render(<App />);
    await waitFor(() => expect(getLands).toHaveBeenCalledOnce());
    await userEvent.click(screen.getByRole('button', { name: /list your land/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Finish polygon' }));
    await userEvent.type(screen.getByLabelText('Total price'), '275000');
    await userEvent.type(screen.getByLabelText('Description'), 'Green parcel');
    await userEvent.type(screen.getByLabelText('Contact'), 'owner@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Publish land' }));
    await waitFor(() => expect(createLand).toHaveBeenCalledWith(expect.objectContaining({
      price: 275000,
      description: 'Green parcel',
      geometry: expect.objectContaining({ type: 'Polygon' }),
    })));
    expect(await screen.findByText('Your land is now live on the map.')).toBeVisible();
    expect(screen.getByText('1 map features')).toBeVisible();
  });

  it('cancels a completed drawing', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /list your land/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Finish polygon' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Tell us about this land')).not.toBeInTheDocument();
  });

  it('shows and dismisses loading errors', async () => {
    getLands.mockRejectedValue(new Error('API unavailable'));
    render(<App />);
    expect(await screen.findByText('API unavailable')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('API unavailable')).not.toBeInTheDocument();
  });

  it('keeps the form open when publication fails', async () => {
    createLand.mockRejectedValue(new Error('The land area overlaps an existing listing.'));
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /list your land/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Finish polygon' }));
    await userEvent.type(screen.getByLabelText('Total price'), '10');
    await userEvent.type(screen.getByLabelText('Description'), 'Parcel');
    await userEvent.type(screen.getByLabelText('Contact'), 'owner@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Publish land' }));
    expect(await screen.findByText('The land area overlaps an existing listing.')).toBeVisible();
    expect(screen.getByText('Tell us about this land')).toBeVisible();
  });

  it('filters lands with a circular search and clears it', async () => {
    getLands.mockResolvedValue([{ id: 'one' }, { id: 'two' }]);
    searchLands.mockResolvedValue([{ id: 'two' }]);
    render(<App />);
    expect(await screen.findByText('2 map features')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /search area/i }));
    expect(screen.getByText('circle active')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Finish circle' }));
    expect(await screen.findByText('1 intersecting land found.')).toBeVisible();
    expect(screen.getByText('1 map features')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByText('2 map features')).toBeVisible();
  });

  it('reports circular search failures', async () => {
    searchLands.mockRejectedValue(new Error('Search unavailable'));
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /search area/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Finish circle' }));
    expect(await screen.findByText('Search unavailable')).toBeVisible();
  });

  it('signs in and signs out', async () => {
    currentUser.mockRejectedValue(new Error('Signed out'));
    login.mockResolvedValue({ id: 'u1', name: 'Ana', email: 'ana@test.com' });
    render(<App />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Sign in' }).at(-1));
    await userEvent.type(screen.getByLabelText('Email'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password1');
    await userEvent.click(screen.getAllByRole('button', { name: 'Sign in' }).at(-1));
    expect(await screen.findByText('Welcome, Ana.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByText('You are signed out.')).toBeVisible();
  });

  it('creates an account', async () => {
    currentUser.mockRejectedValue(new Error('Signed out'));
    register.mockResolvedValue({ id: 'u1', name: 'Ana', email: 'ana@test.com' });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Ana');
    await userEvent.type(screen.getByLabelText('Email'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(await screen.findByText('Your account is ready.')).toBeVisible();
  });
});
