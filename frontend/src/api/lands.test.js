import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLand, getLands, searchLands } from './lands.js';

describe('land API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads available lands', async () => {
    const lands = [{ id: 'land-1' }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(lands) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(getLands()).resolves.toEqual(lands);
    expect(fetchMock).toHaveBeenCalledWith('/api/lands', { headers: {} });
  });

  it('creates a land as JSON', async () => {
    const land = { price: 100, geometry: { type: 'Polygon' } };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ id: 'new' }) });
    vi.stubGlobal('fetch', fetchMock);
    await createLand(land);
    expect(fetchMock).toHaveBeenCalledWith('/api/lands', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(land),
    }));
  });

  it('uses the API error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'This polygon overlaps another land.' }),
    }));
    await expect(getLands()).rejects.toThrow('This polygon overlaps another land.');
  });

  it('searches by circle parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([]) });
    vi.stubGlobal('fetch', fetchMock);
    await searchLands({ longitude: -38.54, latitude: -3.73, radiusMeters: 1200 });
    expect(fetchMock.mock.calls[0][0]).toContain('/api/lands/search?');
    expect(fetchMock.mock.calls[0][0]).toContain('radiusMeters=1200');
  });

  it('falls back safely when an error is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error('invalid JSON')),
    }));
    await expect(getLands()).rejects.toThrow('The request could not be completed.');
  });
});
