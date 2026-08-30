import { useState } from 'react';

const INITIAL_VALUES = { price: '', description: '', contact: '' };

export default function LandForm({ geometry, submitting, onCancel, onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES);

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...values, price: Number(values.price), geometry });
  }

  return (
    <form className="land-form" onSubmit={submit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">New listing</span>
          <h2>Tell us about this land</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Close form">×</button>
      </div>

      <label htmlFor="land-price">Total price</label>
      <div className="field-group">
        <div className="money-input">
          <span>R$</span>
          <input id="land-price" name="price" type="number" min="0.01" step="0.01" required value={values.price} onChange={update} placeholder="250,000" />
        </div>
      </div>

      <label htmlFor="land-description">Description</label>
      <div className="field-group">
        <textarea id="land-description" name="description" maxLength="1000" required value={values.description} onChange={update} placeholder="Access, terrain, nearby landmarks…" rows="4" />
      </div>

      <label htmlFor="land-contact">Contact</label>
      <div className="field-group">
        <input id="land-contact" name="contact" maxLength="255" required value={values.contact} onChange={update} placeholder="Email or phone number" />
      </div>

      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish land'}
        </button>
      </div>
    </form>
  );
}
