// ISO 3166-1 alpha-2 country codes mapped to currency codes
// Used by react-country-flag for SVG flag rendering
export const CURRENCIES = {
  USD: { name: 'US Dollar',          countryCode: 'US' },
  EUR: { name: 'Euro',               countryCode: 'EU' },
  GBP: { name: 'British Pound',      countryCode: 'GB' },
  INR: { name: 'Indian Rupee',       countryCode: 'IN' },
  JPY: { name: 'Japanese Yen',       countryCode: 'JP' },
  AUD: { name: 'Australian Dollar',  countryCode: 'AU' },
  CAD: { name: 'Canadian Dollar',    countryCode: 'CA' },
  CNY: { name: 'Chinese Yuan',       countryCode: 'CN' },
  CHF: { name: 'Swiss Franc',        countryCode: 'CH' },
  HKD: { name: 'Hong Kong Dollar',   countryCode: 'HK' },
  SGD: { name: 'Singapore Dollar',   countryCode: 'SG' },
  SEK: { name: 'Swedish Krona',      countryCode: 'SE' },
  NOK: { name: 'Norwegian Krone',    countryCode: 'NO' },
  DKK: { name: 'Danish Krone',       countryCode: 'DK' },
  MXN: { name: 'Mexican Peso',       countryCode: 'MX' },
  BRL: { name: 'Brazilian Real',     countryCode: 'BR' },
  ZAR: { name: 'South African Rand', countryCode: 'ZA' },
  KRW: { name: 'South Korean Won',   countryCode: 'KR' },
  TRY: { name: 'Turkish Lira',       countryCode: 'TR' },
  AED: { name: 'UAE Dirham',         countryCode: 'AE' },
  SAR: { name: 'Saudi Riyal',        countryCode: 'SA' },
  RUB: { name: 'Russian Ruble',      countryCode: 'RU' },
  PLN: { name: 'Polish Złoty',       countryCode: 'PL' },
  THB: { name: 'Thai Baht',          countryCode: 'TH' },
  IDR: { name: 'Indonesian Rupiah',  countryCode: 'ID' },
  MYR: { name: 'Malaysian Ringgit',  countryCode: 'MY' },
  PHP: { name: 'Philippine Peso',    countryCode: 'PH' },
  NZD: { name: 'New Zealand Dollar', countryCode: 'NZ' },
  PKR: { name: 'Pakistani Rupee',    countryCode: 'PK' },
  EGP: { name: 'Egyptian Pound',     countryCode: 'EG' },
  KWD: { name: 'Kuwaiti Dinar',      countryCode: 'KW' },
  QAR: { name: 'Qatari Riyal',       countryCode: 'QA' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

export function formatNumber(value, decimals = 2, maxDecimals = decimals) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '—';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: maxDecimals,
  });
}

