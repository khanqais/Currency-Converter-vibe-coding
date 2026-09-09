const axios = require('axios');

const BASE_URL = 'https://v6.exchangerate-api.com/v6';

/**
 * Fetch all exchange rates from a base currency.
 * Returns the full conversion_rates object.
 */
async function fetchLatestRates(baseCurrency) {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) throw new Error('EXCHANGERATE_API_KEY not configured');

  const url = `${BASE_URL}/${apiKey}/latest/${baseCurrency.toUpperCase()}`;
  const response = await axios.get(url, { timeout: 10000 });

  if (response.data.result !== 'success') {
    throw new Error(
      `ExchangeRate-API error: ${response.data['error-type'] || 'unknown'}`
    );
  }

  return response.data.conversion_rates;
}

/**
 * Get the rate for a specific currency pair.
 */
async function getRate(from, to) {
  const rates = await fetchLatestRates(from);
  const rate = rates[to.toUpperCase()];
  if (!rate) throw new Error(`Rate not found for ${from} → ${to}`);
  return rate;
}

/**
 * Get rates for multiple target currencies at once (for travel budget).
 */
async function getRatesForCurrencies(base, targets) {
  const rates = await fetchLatestRates(base);
  const result = {};
  for (const target of targets) {
    const code = target.toUpperCase();
    if (rates[code]) result[code] = rates[code];
  }
  return result;
}

module.exports = { fetchLatestRates, getRate, getRatesForCurrencies };
