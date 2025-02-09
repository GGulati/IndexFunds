const API_BASE_URL = '/api/exchange-rates';

export interface ExchangeRate {
  date: string;
  rate: number;
}

// Cache exchange rates in memory
const rateCache = new Map<string, ExchangeRate[]>();

export async function getExchangeRates(currency: string, startDate: string, endDate: string): Promise<ExchangeRate[]> {
  const cacheKey = `${currency}/${startDate}/${endDate}`;
  
  // Check cache first
  if (rateCache.has(cacheKey)) {
    return rateCache.get(cacheKey)!;
  }

  // Fetch from API
  const response = await fetch(
    `${API_BASE_URL}?currency=${currency}&startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  const data = await response.json();
  
  // Transform FRED data to our format
  const rates = data.observations.map((obs: any) => ({
    date: obs.date,
    rate: parseFloat(obs.value)
  })).filter((rate: ExchangeRate) => !isNaN(rate.rate));

  // Cache the results
  rateCache.set(cacheKey, rates);
  
  return rates;
}

export function convertToUSD(value: number, exchangeRate: number): number {
  return value * exchangeRate;
}

export function convertFromUSD(value: number, exchangeRate: number): number {
  return value / exchangeRate;
} 