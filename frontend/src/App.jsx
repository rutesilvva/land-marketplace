import { useCallback, useEffect, useState } from 'react';
import { createLand, getLands, searchLands } from './api/lands.js';
import LandForm from './components/LandForm.jsx';
import LandMap from './components/LandMap.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import ProposalPanel from './components/ProposalPanel.jsx';
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Terra home">
          <span className="brand-mark">T</span>
          <span>terra<small>land marketplace</small></span>
        </a>
        <div className="header-meta"><span className="live-dot" /> {lands.length} active {lands.length === 1 ? 'listing' : 'listings'}</div>
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

      <section className="map-card">
        <LandMap
          lands={lands}
          drawMode={drawMode}
          selectedLand={selectedLand}
          onPolygonDrawn={finishDrawing}
          onCircleDrawn={finishCircle}
          onLandSelect={selectLand}
          onClosePopup={closePopup}
          user={user}
          onProposal={setProposalLand}
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
