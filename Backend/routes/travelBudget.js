const express = require('express');
const router = express.Router();
const { getRatesForCurrencies } = require('../services/exchangeRateApi');

// Default travel currencies — configurable
const TRAVEL_CURRENCIES = ['EUR', 'GBP', 'JPY', 'AUD', 'INR'];

/**
 * GET /api/travel-budget?base=USD&amount=500
 */
router.get('/travel-budget', async (req, res) => {
  try {
    const { base, amount } = req.query;

    if (!base || !amount) {
      return res.status(400).json({ error: 'Missing required params: base, amount' });
    }

    const baseUpper = base.toUpperCase();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Fetch all rates in one API call
    const rates = await getRatesForCurrencies(baseUpper, TRAVEL_CURRENCIES);

    const conversions = TRAVEL_CURRENCIES
      .filter((currency) => rates[currency] !== undefined)
      .map((currency) => ({
        currency,
        rate: rates[currency],
        amount: parseFloat((parsedAmount * rates[currency]).toFixed(2)),
      }));

    res.json({
      base: baseUpper,
      amount: parsedAmount,
      conversions,
    });
  } catch (err) {
    console.error('Travel budget error:', err);
    res.status(503).json({ error: 'Failed to fetch travel rates. Please try again later.' });
  }
});

module.exports = router;
