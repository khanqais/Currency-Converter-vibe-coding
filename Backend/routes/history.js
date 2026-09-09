const express = require('express');
const router = express.Router();
const { historyCache } = require('../db/database');
const { fetchHistoricalRates, getDaysAgo, getToday } = require('../services/historyApi');

/**
 * GET /api/history?from=USD&to=INR
 * Returns 30-day historical rates as [{ date, rate }]
 */
router.get('/history', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing required params: from, to' });
    }

    const fromUpper = from.toUpperCase();
    const toUpper   = to.toUpperCase();
    const startDate = getDaysAgo(30);
    const endDate   = getToday();

    // Same currency — flat rate of 1
    if (fromUpper === toUpper) {
      const data = Array.from({ length: 31 }, (_, i) => ({
        date: getDaysAgo(30 - i),
        rate: 1,
      }));
      return res.json({ from: fromUpper, to: toUpper, startDate, endDate, data });
    }

    // 1. Check SQLite cache (12-hr TTL enforced in database.js)
    const cached = historyCache.get(fromUpper, toUpper);
    if (cached) {
      return res.json({ from: fromUpper, to: toUpper, startDate, endDate, data: cached.data, fromCache: true });
    }

    // 2. Fetch from exchangerate.host
    let data;
    try {
      data = await fetchHistoricalRates(fromUpper, toUpper, startDate, endDate);
    } catch (apiErr) {
      console.error('History API failed:', apiErr.message);
      return res.status(503).json({
        error: 'Historical data service unavailable. Please try again later.',
        details: apiErr.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No historical data returned for this pair.' });
    }

    // 3. Persist to SQLite cache
    historyCache.upsert(fromUpper, toUpper, startDate, endDate, data);

    return res.json({ from: fromUpper, to: toUpper, startDate, endDate, data, fromCache: false });
  } catch (err) {
    console.error('History route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
