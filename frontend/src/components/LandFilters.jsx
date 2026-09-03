export const emptyFilters = { minPrice: '', maxPrice: '', minArea: '', maxArea: '', owner: '', sort: 'newest' };

export function applyLandFilters(lands, filters) {
  const number = (value) => value === '' ? null : Number(value);
  const minPrice = number(filters.minPrice); const maxPrice = number(filters.maxPrice);
  const minArea = number(filters.minArea); const maxArea = number(filters.maxArea);
  const owner = filters.owner.trim().toLowerCase();
  const result = lands.filter((land) =>
    (minPrice === null || land.price >= minPrice) && (maxPrice === null || land.price <= maxPrice) &&
    (minArea === null || land.areaSquareMeters >= minArea) && (maxArea === null || land.areaSquareMeters <= maxArea) &&
    (!owner || (land.ownerName || '').toLowerCase().includes(owner)));
  return [...result].sort((a, b) => {
    if (filters.sort === 'price-low') return a.price - b.price;
    if (filters.sort === 'price-high') return b.price - a.price;
    if (filters.sort === 'area-high') return (b.areaSquareMeters || 0) - (a.areaSquareMeters || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export default function LandFilters({ filters, onChange, onClear }) {
  const field = (name) => ({ value: filters[name], onChange: (event) => onChange({ ...filters, [name]: event.target.value }) });
  return <section className="filter-bar" aria-label="Advanced land filters">
    <input type="number" min="0" placeholder="Min price" aria-label="Minimum price" {...field('minPrice')} />
    <input type="number" min="0" placeholder="Max price" aria-label="Maximum price" {...field('maxPrice')} />
    <input type="number" min="0" placeholder="Min area m²" aria-label="Minimum area" {...field('minArea')} />
    <input type="number" min="0" placeholder="Max area m²" aria-label="Maximum area" {...field('maxArea')} />
    <input placeholder="Owner" aria-label="Owner name" {...field('owner')} />
    <select aria-label="Sort lands" {...field('sort')}><option value="newest">Newest</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option><option value="area-high">Largest area</option></select>
    <button className="button secondary" type="button" onClick={onClear}>Clear filters</button>
  </section>;
}
