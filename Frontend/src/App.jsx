import React, { useState, useCallback, useRef } from 'react';
import './index.css';
import CurrencyConverter from './components/CurrencyConverter';
import TrendChart from './components/TrendChart';
import FavoritesList from './components/FavoritesList';
import TravelBudgetMode from './components/TravelBudgetMode';
import api from './services/api';

export default function App() {
  const [from, setFrom]             = useState('USD');
  const [to, setTo]                 = useState('INR');
  const [amount, setAmount]         = useState('100');
  const [travelMode, setTravelMode] = useState(false);
  const [favMsg, setFavMsg]         = useState('');
  const favRef                      = useRef(null);

  // Called when user stars a pair in the converter
  const handleAddFavorite = useCallback(async (fromC, toC) => {
    try {
      await api.post('/api/favorites', { from: fromC, to: toC });
      setFavMsg(`${fromC} → ${toC} added to favorites!`);
      // Refresh sidebar
      if (favRef.current) favRef.current.fetchFavorites();
    } catch (err) {
      // 409 = already exists, treat as success
      if (err.message.includes('already')) {
        setFavMsg(`${fromC} → ${toC} is already in favorites.`);
      } else {
        setFavMsg(`Could not save: ${err.message}`);
      }
    }
    setTimeout(() => setFavMsg(''), 3000);
  }, []);

  // Called when user clicks a favorite in sidebar
  const handleSelectPair = useCallback((f, t) => {
    setFrom(f);
    setTo(t);
  }, []);

  return (
    <div className="app-root">
      {/* Header */}
      <header className="app-header" role="banner">
        <div className="app-header-logo">
          <div className="logo-mark" aria-hidden="true">FF</div>
          <span className="logo-name">Forex<span>Flow</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Travel mode toggle */}
          <label
            className="mode-toggle-bar"
            style={{ margin: 0, padding: '8px 14px', cursor: 'pointer' }}
            htmlFor="travel-mode-toggle"
            title="Toggle travel budgeting mode"
          >
            <span className="mode-toggle-label">
              <span className="icon" aria-hidden="true">✈️</span>
              Travel Mode
            </span>
            <label className="toggle-switch" style={{ marginLeft: '12px' }}>
              <input
                id="travel-mode-toggle"
                type="checkbox"
                checked={travelMode}
                onChange={(e) => setTravelMode(e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </label>
        </div>
      </header>

      {/* Body */}
      <div className="app-body">
        {/* Main content */}
        <main className="app-main" id="main-content">
          {/* Notification */}
          {favMsg && (
            <div
              className="badge badge--green animate-fadeIn"
              style={{ marginBottom: '16px', padding: '8px 14px', fontSize: '0.82rem', display: 'inline-flex' }}
              role="status"
              aria-live="polite"
            >
              ✓ {favMsg}
            </div>
          )}

          {travelMode ? (
            /* Travel budgeting mode */
            <TravelBudgetMode defaultBase={from} />
          ) : (
            /* Normal converter + chart */
            <>
              <CurrencyConverter
                from={from}
                to={to}
                amount={amount}
                onFromChange={setFrom}
                onToChange={setTo}
                onAmountChange={setAmount}
                onAddFavorite={handleAddFavorite}
              />
              <TrendChart from={from} to={to} />
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside className="app-sidebar" aria-label="Favorites">
          <FavoritesList
            ref={favRef}
            onSelectPair={handleSelectPair}
          />
        </aside>
      </div>
    </div>
  );
}
