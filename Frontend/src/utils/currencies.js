// Shared currency data: ISO code → { name, flag emoji }
export const CURRENCIES = {
  USD: { name: 'US Dollar',        flag: '🇺🇸' },
  EUR: { name: 'Euro',             flag: '🇪🇺' },
  GBP: { name: 'British Pound',    flag: '🇬🇧' },
  INR: { name: 'Indian Rupee',     flag: '🇮🇳' },
  JPY: { name: 'Japanese Yen',     flag: '🇯🇵' },
  AUD: { name: 'Australian Dollar',flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar',  flag: '🇨🇦' },
  CNY: { name: 'Chinese Yuan',     flag: '🇨🇳' },
  CHF: { name: 'Swiss Franc',      flag: '🇨🇭' },
  HKD: { name: 'Hong Kong Dollar', flag: '🇭🇰' },
  SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
  SEK: { name: 'Swedish Krona',    flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone',  flag: '🇳🇴' },
  DKK: { name: 'Danish Krone',     flag: '🇩🇰' },
  MXN: { name: 'Mexican Peso',     flag: '🇲🇽' },
  BRL: { name: 'Brazilian Real',   flag: '🇧🇷' },
  ZAR: { name: 'South African Rand', flag: '🇿🇦' },
  KRW: { name: 'South Korean Won', flag: '🇰🇷' },
  TRY: { name: 'Turkish Lira',     flag: '🇹🇷' },
  AED: { name: 'UAE Dirham',       flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal',      flag: '🇸🇦' },
  RUB: { name: 'Russian Ruble',    flag: '🇷🇺' },
  PLN: { name: 'Polish Złoty',     flag: '🇵🇱' },
  THB: { name: 'Thai Baht',        flag: '🇹🇭' },
  IDR: { name: 'Indonesian Rupiah',flag: '🇮🇩' },
  MYR: { name: 'Malaysian Ringgit',flag: '🇲🇾' },
  PHP: { name: 'Philippine Peso',  flag: '🇵🇭' },
  NZD: { name: 'New Zealand Dollar',flag: '🇳🇿' },
  PKR: { name: 'Pakistani Rupee',  flag: '🇵🇰' },
  EGP: { name: 'Egyptian Pound',   flag: '🇪🇬' },
  KWD: { name: 'Kuwaiti Dinar',    flag: '🇰🇼' },
  QAR: { name: 'Qatari Riyal',     flag: '🇶🇦' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

// Format a number with proper locale formatting
export function formatAmount(value, currency) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  } catch {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`;
  }
}

// Get short formatted amount without currency symbol
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 6,
  });
}
