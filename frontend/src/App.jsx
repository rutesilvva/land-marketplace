import { useCallback, useEffect, useMemo, useState } from 'react';
import { cancelLandReservation, createLand, getLands, reserveLand, searchLands } from './api/lands.js';
import LandForm from './components/LandForm.jsx';
import LandMap from './components/LandMap.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import ProposalPanel from './components/ProposalPanel.jsx';
import LandFilters, { applyLandFilters, emptyFilters } from './components/LandFilters.jsx';
import { clearCredentials, currentUser, login, register } from './api/auth.js';

export default function App() {
  const [lands, setLands] = useState([]);
  const [allLands, setAllLands] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [drawMode, setDrawMode] = useState(null);
  const [draftGeometry, setDraftGeometry] = useState(null);
  const [selectedLand, setSelectedLand] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [proposalLand, setProposalLand] = useState(undefined);
  const [filters, setFilters] = useState(emptyFilters);
  const visibleLands = useMemo(() => applyLandFilters(lands, filters), [lands, filters]);

  const loadLands = useCallback(async () => {
    try {
      const loaded = await getLands();
      setLands(loaded);
      setAllLands(loaded);
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    }
  }, []);

  useEffect(() => { loadLands(); }, [loadLands]);
  useEffect(() => { currentUser().then(setUser).catch(clearCredentials); }, []);

  const selectLand = useCallback((land) => setSelectedLand(land), []);
  const closePopup = useCallback(() => setSelectedLand(null), []);
  const finishDrawing = useCallback((geometry) => {
    setDraftGeometry(geometry);
    setDrawMode(null);
  }, []);

  const finishCircle = useCallback(async (circle) => {
    setDrawMode(null);
    try {
      const results = await searchLands(circle);
      setLands(results);
      setSearchActive(true);
      setNotice({ type: 'success', message: `${results.length} intersecting ${results.length === 1 ? 'land' : 'lands'} found.` });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    }
  }, []);

  function startDrawing() {
    if (!user) {
      setAuthOpen(true);
      setNotice({ type: 'error', message: 'Sign in to publish land.' });
      return;
    }
    setSelectedLand(null);
    setDraftGeometry(null);
    setNotice(null);
    setDrawMode('polygon');
  }

  function cancelDrawing() {
    setDrawMode(null);
    setDraftGeometry(null);
  }

  function startSearch() {
    setSelectedLand(null);
    setNotice(null);
    setDrawMode('circle');
  }

  function clearSearch() {
    setLands(allLands);
    setSearchActive(false);
    setDrawMode(null);
    setNotice(null);
  }

  async function publishLand(values) {
    setSubmitting(true);
    setNotice(null);
    try {
      const created = await createLand(values);
      setLands((current) => [...current, created]);
      setAllLands((current) => [...current, created]);
      setDraftGeometry(null);
      setNotice({ type: 'success', message: 'Your land is now live on the map.' });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function signIn(email, password) {
    const account = await login(email, password);
    setUser(account);
    setNotice({ type: 'success', message: `Welcome, ${account.name}.` });
  }

  async function signUp(values) {
    const account = await register(values);
    setUser(account);
    setNotice({ type: 'success', message: 'Your account is ready.' });
  }

  function logout() {
    clearCredentials();
    setUser(null);
    setProposalLand(undefined);
    setNotice({ type: 'success', message: 'You are signed out.' });
  }

  async function changeReservation(land, cancel = false) {
    try {
      const updated = cancel ? await cancelLandReservation(land.id) : await reserveLand(land.id);
      const replace = (items) => items.map((item) => item.id === updated.id ? updated : item);
      setLands(replace); setAllLands(replace); setSelectedLand(updated);
      setNotice({ type: 'success', message: cancel ? 'Reservation cancelled.' : 'Land reserved for 30 minutes.' });
    } catch (error) { setNotice({ type: 'error', message: error.message }); }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Parcel home">
          <span className="brand-mark">P</span>
          <span>Parcel<small>land marketplace</small></span>
        </a>
        <div className="header-meta"><span className="live-dot" /> {visibleLands.length} active {visibleLands.length === 1 ? 'listing' : 'listings'}</div>
        <div className="header-actions">
        {user ? <><button className="button secondary" type="button" onClick={() => setProposalLand(null)}>Proposals</button><span className="user-chip">{user.name}</span><button className="button secondary" type="button" onClick={logout}>Sign out</button></> : <button className="button secondary" type="button" onClick={() => setAuthOpen(true)}>Sign in</button>}
        <button className="button search-button" type="button" onClick={startSearch} disabled={Boolean(drawMode)}>
          <span aria-hidden="true">⌖</span> Search area
        </button>
        {searchActive && <button className="button secondary" type="button" onClick={clearSearch}>Clear search</button>}
        <button className="button primary header-action" type="button" onClick={startDrawing} disabled={Boolean(drawMode)}>
          <span aria-hidden="true">＋</span> List your land
        </button>
        </div>
      </header>

      <section className="hero-copy">
        <span className="eyebrow">Explore opportunity</span>
        <h1>Land, clearly mapped.</h1>
        <p>Browse verified boundaries or draw your own parcel to publish a listing.</p>
      </section>
      <LandFilters filters={filters} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />

      <section className="map-card">
        <LandMap
          lands={visibleLands}
          drawMode={drawMode}
          selectedLand={selectedLand}
          onPolygonDrawn={finishDrawing}
          onCircleDrawn={finishCircle}
          onLandSelect={selectLand}
          onClosePopup={closePopup}
          user={user}
          onProposal={setProposalLand}
          onReservation={changeReservation}
        />
        <div className="map-legend"><span /> Available land</div>
      </section>

      {draftGeometry && (
        <div className="panel-backdrop">
          <aside className="form-panel">
            <LandForm geometry={draftGeometry} submitting={submitting} onCancel={cancelDrawing} onSubmit={publishLand} />
          </aside>
        </div>
      )}

      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} onLogin={signIn} onRegister={signUp} />}
      {proposalLand !== undefined && <ProposalPanel land={proposalLand} onClose={() => setProposalLand(undefined)} notice={(type, message) => setNotice({ type, message })} />}

      {notice && (
        <div className={`toast ${notice.type}`} role="status">
          <span>{notice.type === 'success' ? '✓' : '!'}</span>{notice.message}
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </main>
  );
}
