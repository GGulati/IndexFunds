const BASE_URL = '/api/market';

export interface MarketIndex {
  symbol: string;
  name: string;
  exchange: string;
  region: string;
}

export async function getGlobalIndices(): Promise<MarketIndex[]> {
  const response = await fetch(`${BASE_URL}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch market indices');
  }

  const data = await response.json();
  return data;
} 