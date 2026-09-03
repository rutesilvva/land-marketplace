import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LandFilters, { applyLandFilters, emptyFilters } from './LandFilters.jsx';

const lands = [
  { id: '1', price: 200, areaSquareMeters: 500, ownerName: 'Morgan', createdAt: '2026-01-01' },
  { id: '2', price: 100, areaSquareMeters: 900, ownerName: 'Alex', createdAt: '2026-02-01' },
  { id: '3', price: 300, areaSquareMeters: 200, ownerName: null, createdAt: '2025-01-01' },
];

describe('LandFilters', () => {
  it('filters by price, area and owner', () => {
    expect(applyLandFilters(lands, { ...emptyFilters, minPrice: '90', maxPrice: '250', minArea: '400', maxArea: '800', owner: 'MOR' }).map(l => l.id)).toEqual(['1']);
  });
  it.each([['price-low', ['2','1','3']], ['price-high', ['3','1','2']], ['area-high', ['2','1','3']]])('sorts by %s', (sort, ids) => {
    expect(applyLandFilters(lands, { ...emptyFilters, sort }).map(l => l.id)).toEqual(ids);
  });
  it('updates and clears controls', () => {
    const change = vi.fn(); const clear = vi.fn();
    render(<LandFilters filters={emptyFilters} onChange={change} onClear={clear} />);
    fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '50' } });
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ minPrice: '50' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' })); expect(clear).toHaveBeenCalled();
  });
});
