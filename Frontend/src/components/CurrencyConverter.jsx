import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { CURRENCIES, CURRENCY_CODES, formatNumber } from '../utils/currencies';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const DEBOUNCE_MS = 600;

export default function CurrencyConverter({ from, to, amount, onFromChange, onToChange, onAmountChange, onAddFavorite }) {
  const [result, setResult]     = useState(null);
  const [rate, setRate]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fromCache, setFromCache] = useState(false);
  const debounceRef             = useRef(null);

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
      setFromCache(res.data.fromCache || false);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced trigger on any input change
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

  const formattedResult = result !== null ? formatNumber(result, 4) : null;

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

      {/* Currency selectors row */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="from-currency">From</label>
          <select
            id="from-currency"
            className="form-select"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].flag} {code} — {CURRENCIES[code].name}
              </option>
            ))}
          </select>
        </div>

        <button
          id="swap-currencies-btn"
          className="swap-btn"
          onClick={handleSwap}
          title="Swap currencies"
          aria-label="Swap from and to currencies"
        >
          ⇄
        </button>

        <div className="form-group">
          <label className="form-label" htmlFor="to-currency">To</label>
          <select
            id="to-currency"
            className="form-select"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].flag} {code} — {CURRENCIES[code].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount input */}
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

      {/* Error */}
      <ErrorMessage message={error} />

      {/* Result */}
      {loading && (
        <div className="flex-center" style={{ padding: '24px 0' }}>
          <LoadingSpinner />
          <span style={{ marginLeft: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fetching rate…</span>
        </div>
      )}

      {!loading && formattedResult !== null && (
        <div className="result-card">
          <div className="result-label">
            {formatNumber(parseFloat(amount), 2)} {from} equals
          </div>
          <div className="result-amount" id="conversion-result">
            {formattedResult} <span style={{ color: 'var(--accent-teal-lt)' }}>{to}</span>
          </div>
          <div className="result-meta">
            <span className="result-rate">
              1 {from} = {formatNumber(rate, 6)} {to}
            </span>
            {fromCache && <span className="cache-badge">⚡ cached</span>}
          </div>
        </div>
      )}
    </div>
  );
}
