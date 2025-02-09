import { countries, currencies } from 'country-data';

// Create lookup maps for faster access
const CURRENCY_TO_COUNTRIES = new Map<string, Array<{
  name: string;
  alpha2: string;
}>>(); 

// Build currency to countries map
Object.values(countries.all).forEach(country => {
  if (country.currencies?.length > 0) {
    const currency = country.currencies[0];
    const countryData = { name: country.name, alpha2: country.alpha2 };
    
    if (CURRENCY_TO_COUNTRIES.has(currency)) {
      CURRENCY_TO_COUNTRIES.get(currency)!.push(countryData);
    } else {
      CURRENCY_TO_COUNTRIES.set(currency, [countryData]);
    }
  }
});

export function getCountriesFromCurrency(currency: string) {
  return CURRENCY_TO_COUNTRIES.get(currency);
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
  const country = getCountriesFromCurrency(currency);
  if (!country) return currency;
  
  const currencyData = currencies[currency];
  const symbol = currencyData?.symbol || currency;
  
  return `${getFlagEmoji(country[0].alpha2)} ${symbol}`;
} 