const axios = require('axios');

const BASE_URL = 'https://api.exchangerate.host/timeframe';

/**
 * Fetch historical exchange rates for a currency pair over a date range.
 * Returns an array of { date, rate } objects sorted by date ascending.
 */
async function fetchHistoricalRates(from, to, startDate, endDate) {
  const apiKey = process.env.EXCHANGERATE_HOST_KEY;
  if (!apiKey) throw new Error('EXCHANGERATE_HOST_KEY not configured');

  const response = await axios.get(BASE_URL, {
    params: {
      access_key: apiKey,
      start_date: startDate,
      end_date: endDate,
      source: from.toUpperCase(),
      currencies: to.toUpperCase(),
    },
    timeout: 15000,
  });

  const data = response.data;

  if (!data.success) {
    throw new Error(
      `exchangerate.host error: ${data.error?.info || 'Request failed'}`
    );
  }

  // data.quotes is an object keyed by date, each value is { "USDEUR": rate }
  const pairKey = `${from.toUpperCase()}${to.toUpperCase()}`;
  const quotes = data.quotes || {};

  const result = Object.entries(quotes)
    .map(([date, rates]) => ({
      date,
      rate: rates[pairKey] ?? null,
    }))
    .filter((item) => item.rate !== null)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return result;
}

/**
 * Get the date string for N days ago in YYYY-MM-DD format.
 */
function getDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Get today's date string in YYYY-MM-DD format.
 */
function getToday() {
  return new Date().toISOString().split('T')[0];
}

module.exports = { fetchHistoricalRates, getDaysAgo, getToday };
