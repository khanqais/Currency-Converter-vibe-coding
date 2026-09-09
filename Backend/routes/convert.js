const express = require('express');
const router = express.Router();
const { conversionCache, conversionHistory } = require('../db/database');
const { getRate } = require('../services/exchangeRateApi');

const VALID_CURRENCIES = new Set([
  'USD','EUR','GBP','INR','JPY','AUD','CAD','CNY','CHF','HKD',
  'SGD','SEK','NOK','DKK','MXN','BRL','ZAR','KRW','TRY','AED',
  'SAR','RUB','PLN','THB','IDR','MYR','PHP','CZK','HUF','ILS',
  'NZD','PKR','EGP','NGN','KWD','QAR','OMR','BHD','JOD',
]);

/**
 * GET /api/convert?from=USD&to=INR&amount=100
 */
router.get('/convert', async (req, res) => {
  try {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required params: from, to, amount' });
    }

    const fromUpper   = from.toUpperCase();
    const toUpper     = to.toUpperCase();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (!VALID_CURRENCIES.has(fromUpper) || !VALID_CURRENCIES.has(toUpper)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    // Same currency shortcut
    if (fromUpper === toUpper) {
      return res.json({ from: fromUpper, to: toUpper, amount: parsedAmount, result: parsedAmount, rate: 1, fromCache: true });
    }

    let rate;
    let fromCache = false;

    // 1. Check SQLite cache (TTL enforced inside database.js)
    const cached = conversionCache.get(fromUpper, toUpper);
    if (cached) {
      rate = cached.rate;
      fromCache = true;
    } else {
      // 2. Fetch from ExchangeRate-API
      try {
        rate = await getRate(fromUpper, toUpper);
        conversionCache.upsert(fromUpper, toUpper, rate);
      } catch (apiErr) {
        console.error('ExchangeRate-API failed:', apiErr.message);
        // 3. Fallback: any stale cached rate
        const stale = require('../db/database').db
          .prepare('SELECT rate FROM conversion_cache WHERE from_currency = ? AND to_currency = ? LIMIT 1')
          .get(fromUpper, toUpper);
        if (stale) {
          rate = stale.rate;
          fromCache = true;
        } else {
          return res.status(503).json({ error: 'Rate service unavailable and no cached data found.' });
        }
      }
    }

    const result = parseFloat((parsedAmount * rate).toFixed(6));

    // Log conversion (fire-and-forget)
    conversionHistory.log(fromUpper, toUpper, parsedAmount, result, rate);

    return res.json({ from: fromUpper, to: toUpper, amount: parsedAmount, result, rate, fromCache });
  } catch (err) {
    console.error('Convert route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
