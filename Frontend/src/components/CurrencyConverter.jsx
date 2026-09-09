import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactCountryFlag from 'react-country-flag';
import api from '../services/api';
import { CURRENCIES, CURRENCY_CODES, formatNumber } from '../utils/currencies';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const DEBOUNCE_MS = 600;

/* ─── Flag component (SVG, always renders correctly on Windows) ─────────────── */
function Flag({ code, size = '1.4rem', style = {} }) {
  const countryCode = CURRENCIES[code]?.countryCode;
  if (!countryCode) return null;
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{
        width: size,
        height: size,
        borderRadius: '3px',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
      }}
      title={CURRENCIES[code]?.name}
    />
  );
}

/* ─── Custom Currency Dropdown ──────────────────────────────────────────────── */
function CurrencySelect({ id, label, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef          = useRef(null);
  const searchRef           = useRef(null);

  const current = CURRENCIES[value];

  const filtered = CURRENCY_CODES.filter((code) => {
    const q = search.toLowerCase();
    return (
      code.toLowerCase().includes(q) ||
      CURRENCIES[code].name.toLowerCase().includes(q)
    );
  });

  // Close on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label className="form-label" htmlFor={id}>{label}</label>

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        className="currency-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Flag code={value} size="2rem" />
        <span className="currency-trigger-info">
          <span className="currency-trigger-code">{value}</span>
          <span className="currency-trigger-name">{current?.name}</span>
        </span>
        <span className="currency-trigger-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="currency-dropdown" role="listbox" aria-label={label}>
          {/* Search */}
          <div className="currency-search-wrap">
            <span className="currency-search-icon">🔍</span>
            <input
              ref={searchRef}
              type="text"
              className="currency-search-input"
              placeholder="Search currency or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <ul className="currency-list">
            {filtered.length === 0 && (
              <li className="currency-list-empty">No results</li>
            )}
            {filtered.map((code) => {
              const c       = CURRENCIES[code];
              const selected = code === value;
              return (
                <li
                  key={code}
                  role="option"
                  aria-selected={selected}
                  className={`currency-option${selected ? ' currency-option--selected' : ''}`}
                  onClick={() => handleSelect(code)}
                >
                  <Flag code={code} size="1.5rem" />
                  <span className="currency-option-info">
                    <span className="currency-option-code">{code}</span>
                    <span className="currency-option-name">{c.name}</span>
                  </span>
                  {selected && <span className="currency-option-check">✓</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Main Converter ────────────────────────────────────────────────────────── */
export default function CurrencyConverter({ from, to, amount, onFromChange, onToChange, onAmountChange, onAddFavorite }) {
  const [result, setResult]   = useState(null);
  const [rate, setRate]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const debounceRef           = useRef(null);

  const doConvert = useCallback(async (fromC, toC, amt) => {
    const parsedAmt = parseFloat(amt);
    if (!fromC || !toC || !amt || isNaN(parsedAmt) || parsedAmt <= 0) {
      setResult(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/convert', {
        params: { from: fromC, to: toC, amount: parsedAmt },
      });
      setResult(res.data.result);
      setRate(res.data.rate);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doConvert(from, to, amount);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [from, to, amount, doConvert]);

  const handleSwap = () => {
    const prevFrom = from;
    onFromChange(to);
    onToChange(prevFrom);
  };

  const formattedResult = result !== null ? formatNumber(result, 2) : null;

  return (
    <div className="card card--accent animate-fadeIn">
      <div className="section-header" style={{ marginBottom: '18px' }}>
        <p className="section-title">💱 Converter</p>
        <button
          id="add-favorite-btn"
          className="btn--icon btn"
          title="Add to favorites"
          onClick={() => onAddFavorite && onAddFavorite(from, to)}
          aria-label={`Add ${from}/${to} to favorites`}
        >
          ★
        </button>
      </div>

      {/* Selectors */}
      <div className="form-row">
        <CurrencySelect id="from-currency" label="From" value={from} onChange={onFromChange} />

        <button
          id="swap-currencies-btn"
          className="swap-btn"
          onClick={handleSwap}
          title="Swap currencies"
          aria-label="Swap currencies"
        >
          ⇄
        </button>

        <CurrencySelect id="to-currency" label="To" value={to} onChange={onToChange} />
      </div>

      {/* Amount */}
      <div className="form-group mb-4">
        <label className="form-label" htmlFor="amount-input">Amount</label>
        <input
          id="amount-input"
          type="number"
          className="form-input"
          placeholder="Enter amount…"
          value={amount}
          min="0"
          step="any"
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>

      <ErrorMessage message={error} />

      {loading && (
        <div className="flex-center" style={{ padding: '24px 0' }}>
          <LoadingSpinner />
          <span style={{ marginLeft: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Fetching rate…
          </span>
        </div>
      )}

      {!loading && formattedResult !== null && (
        <div className="result-card">
          {/* Flag pair */}
          <div className="result-flags">
            <Flag code={from} size="2.4rem" style={{ borderRadius: '4px' }} />
            <span className="result-flag-arrow">→</span>
            <Flag code={to} size="2.4rem" style={{ borderRadius: '4px' }} />
          </div>

          <div className="result-label">
            {formatNumber(parseFloat(amount), 2)} {from} equals
          </div>
          <div className="result-amount" id="conversion-result">
            {formattedResult}{' '}
            <span style={{ color: 'var(--accent-teal-lt)' }}>{to}</span>
          </div>

          {rate !== null && (
            <div className="result-rate-row">
              1 {from} = {formatNumber(rate, 4)} {to}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
