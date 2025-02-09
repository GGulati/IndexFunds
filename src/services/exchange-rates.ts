const API_BASE_URL = '/api/exchange-rates';

export interface ExchangeRate {
  date: string;
  rate: number;
}

// Cache exchange rates in memory
const rateCache = new Map<string, ExchangeRate[]>();

export async function getExchangeRate(currency: string): Promise<ExchangeRate[]> {
  // Check cache first
  const cacheKey = currency;
  if (rateCache.has(cacheKey)) {
    return rateCache.get(cacheKey)!;
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
  rateCache.set(cacheKey, rates);
  
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