import { Cache } from './cache';

const API_BASE_URL = '/api/exchange-rates';

export interface ExchangeRate {
  date: string;
  rate: number;
}

const CACHE_DURATION = {
  RATES: 24 * 60 * 60 * 1000,  // 24 hours for exchange rates
};

// Initialize cache
const exchangeRateCache = new Cache<string, ExchangeRate[]>(CACHE_DURATION.RATES);

export async function getExchangeRate(currency: string): Promise<ExchangeRate[]> {
  const cached = exchangeRateCache.get(currency);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(`${API_BASE_URL}?currency=${currency}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rate');
  }

  const data = await response.json();
  const rates = data.observations.map((obs: any) => ({
    date: obs.date,
    rate: parseFloat(obs.value)
  })).filter((rate: ExchangeRate) => !isNaN(rate.rate));
  
  // Cache the result
  exchangeRateCache.set(currency, rates);
  
  return rates;
}

// Helper to get rate for a specific date
export function getRateForDate(rates: ExchangeRate[], date: string): number {
  const rate = rates.find(r => r.date === date);
  if (!rate) {
    // Find closest previous date if exact date not found
    const closestRate = rates
      .filter(r => r.date <= date)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    return closestRate?.rate ?? 1;
  }
  return rate.rate;
}

export function convertToUSD(value: number, rate: number): number {
  return value * rate;
}

export function convertFromUSD(value: number, rate: number): number {
  return value / rate;
}

// Clean up expired entries periodically
setInterval(() => {
  exchangeRateCache.cleanup();
}, 60 * 60 * 1000); // Every hour 