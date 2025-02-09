import { countries, currencies } from 'country-data';

// Create lookup maps for faster access
const CURRENCY_TO_COUNTRY = new Map(
  Object.values(countries.all)
    .filter(country => country.currencies?.length > 0)
    .map(country => [country.currencies[0], country])
);

export function getCountryFromCurrency(currency: string) {
  return CURRENCY_TO_COUNTRY.get(currency);
}

export function getCurrencyData(currency: string) {
  return currencies[currency];
}

export function formatCurrency(value: number, currency: string): string {
  const currencyData = currencies[currency];
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyData?.decimals ?? 2,
    maximumFractionDigits: currencyData?.decimals ?? 2
  }).format(value);
}

// Get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  if (countryCode === 'EU') {
    return '🇪🇺'; // Special case for EU
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Format currency with flag
export function formatCurrencyWithFlag(currency: string): string {
  const country = getCountryFromCurrency(currency);
  if (!country) return currency;
  
  const currencyData = currencies[currency];
  const symbol = currencyData?.symbol || currency;
  
  return `${getFlagEmoji(country)} ${symbol}`;
} 