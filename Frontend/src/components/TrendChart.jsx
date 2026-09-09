import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { ChartSkeleton } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { formatNumber } from '../utils/currencies';

// Custom tooltip component for Recharts
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      <div className="chart-tooltip-value">{formatNumber(payload[0].value, 6)}</div>
    </div>
  );
}

export default function TrendChart({ from, to }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!from || !to) return;

    let cancelled = false;
    setLoading(true);
    setError('');
    setData([]);

    api
      .get('/api/history', { params: { from, to } })
      .then((res) => {
        if (!cancelled) {
          // Format dates for display (show MM/DD)
          const formatted = res.data.data.map((d) => ({
            ...d,
            displayDate: d.date.slice(5), // "YYYY-MM-DD" → "MM-DD"
          }));
          setData(formatted);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [from, to]);

  // Compute Y-axis domain with padding
  const rates = data.map((d) => d.rate).filter(Boolean);
  const minRate = rates.length ? Math.min(...rates) : 0;
  const maxRate = rates.length ? Math.max(...rates) : 1;
  const padding = (maxRate - minRate) * 0.05 || 0.01;

  return (
    <div className="card animate-fadeIn">
      <div className="section-header">
        <p className="section-title">📈 30-Day Trend</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {from} / {to}
        </span>
      </div>

      {loading && <ChartSkeleton />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && !error && data.length > 0 && (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minRate - padding, maxRate + padding]}
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(v) => formatNumber(v, 4)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6', stroke: 'var(--bg-card)', strokeWidth: 2 }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No historical data available for this pair.
        </div>
      )}
    </div>
  );
}
