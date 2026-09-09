import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { CURRENCIES, CURRENCY_CODES, formatNumber } from '../utils/currencies';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const TRAVEL_CURRENCIES_META = {
  EUR: { flag: '🇪🇺', name: 'Euro' },
  GBP: { flag: '🇬🇧', name: 'British Pound' },
  JPY: { flag: '🇯🇵', name: 'Japanese Yen' },
  AUD: { flag: '🇦🇺', name: 'Australian Dollar' },
  INR: { flag: '🇮🇳', name: 'Indian Rupee' },
};

export default function TravelBudgetMode({ defaultBase = 'USD' }) {
  const [base, setBase]         = useState(defaultBase);
  const [amount, setAmount]     = useState('1000');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const fetchBudget = useCallback(async (b, a) => {
    const parsedAmt = parseFloat(a);
    if (!b || !a || isNaN(parsedAmt) || parsedAmt <= 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/travel-budget', {
        params: { base: b, amount: parsedAmt },
      });
      setResults(res.data.conversions || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget(base, amount);
  }, [base, amount, fetchBudget]);

  return (
    <div className="card animate-fadeIn">
      <div className="section-header" style={{ marginBottom: '18px' }}>
        <p className="section-title">✈️ Travel Budget</p>
        <span className="badge badge--green">
          <span>●</span> Multi-currency
        </span>
      </div>

      {/* Controls */}
      <div className="amount-row" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="travel-base-currency">Base Currency</label>
          <select
            id="travel-base-currency"
            className="form-select"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].flag} {code} — {CURRENCIES[code].name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="travel-amount">Budget Amount</label>
          <input
            id="travel-amount"
            type="number"
            className="form-input"
            placeholder="Enter budget…"
            value={amount}
            min="0"
            step="any"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading && (
        <div className="flex-center" style={{ padding: '32px 0' }}>
          <LoadingSpinner />
          <span style={{ marginLeft: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Calculating…
          </span>
        </div>
      )}

      {!loading && results.length > 0 && (
        <table className="budget-table" id="travel-budget-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th style={{ textAlign: 'right' }}>Converted</th>
              <th style={{ textAlign: 'right' }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => {
              const meta = TRAVEL_CURRENCIES_META[item.currency] || { flag: '', name: item.currency };
              return (
                <tr key={item.currency}>
                  <td>
                    <span className="budget-currency-flag">{meta.flag}</span>
                    <span className="budget-currency-code">{item.currency}</span>
                    <span className="budget-currency-name">{meta.name}</span>
                  </td>
                  <td>
                    <div className="budget-amount">{formatNumber(item.amount, 2)}</div>
                  </td>
                  <td>
                    <div className="budget-rate">1 {base} = {formatNumber(item.rate, 6)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
