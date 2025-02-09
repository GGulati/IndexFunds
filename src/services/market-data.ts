import { Cache } from './cache';

const API_BASE_URL = '/api/market';

export interface MarketIndex {
  symbol: string;
  name: string;
  region: string;
  exchange: string;
  color: string;
}

const CACHE_DURATION = {
  INDICES: 60 * 60 * 1000,  // 1 hour for market indices list
};

// Initialize cache
const marketDataCache = new Cache<string, MarketIndex[]>(CACHE_DURATION.INDICES);

export async function getGlobalIndices(): Promise<MarketIndex[]> {
  const CACHE_KEY = 'global_indices';
  const cached = marketDataCache.get(CACHE_KEY);
  if (cached) {
    return cached;
  }

  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch market indices');
  }

  const indices = await response.json();
  
  // Cache the result
  marketDataCache.set(CACHE_KEY, indices);
  
  return indices;
}
