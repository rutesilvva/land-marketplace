function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function LandPopup({ land, onClose, user, onProposal, onReservation }) {
  if (!land) return null;

  return (
    <article className="land-popup" role="dialog" aria-label="Land details">
      <button className="popup-close" type="button" onClick={onClose} aria-label="Close details">×</button>
      <span className={`status-pill ${land.reserved ? 'reserved' : ''}`}>{land.reserved ? 'Reserved' : 'Available'}</span>
      <strong>{formatPrice(land.price)}</strong>
      <p>{land.description}</p>
      {land.ownerName && <small>Listed by {land.ownerName}</small>}
      {land.areaSquareMeters > 0 && <small>{Math.round(land.areaSquareMeters).toLocaleString()} m²</small>}
      <a href={`mailto:${land.contact}`}>{land.contact}</a>
      {user && land.ownerId && user.id !== land.ownerId && <button className="button primary popup-proposal" type="button" onClick={() => onProposal(land)}>Make proposal</button>}
      {user && land.ownerId && user.id !== land.ownerId && (!land.reserved || land.reservedById === user.id) && <button className="button secondary popup-proposal" type="button" onClick={() => onReservation(land, land.reservedById === user.id)}>{land.reservedById === user.id ? 'Cancel reservation' : 'Reserve for 30 minutes'}</button>}
    </article>
  );
}
