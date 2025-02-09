import { NextResponse } from 'next/server';
import { currencies } from 'country-data';

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

// Special cases where the FRED series ID doesn't follow the standard pattern
const SPECIAL_SERIES_IDS: Record<string, string> = {
  'GBP': 'DEXUSUK',  // UK instead of GB
  'CHF': 'DEXSZUS',  // SZ for Switzerland
  'NZD': 'DEXUSNZ',  // Special case for New Zealand
  'ZAR': 'DEXSFUS',  // SF for South Africa
};

function getSeriesId(currency: string): string {
  // Check special cases first
  if (currency in SPECIAL_SERIES_IDS) {
    return SPECIAL_SERIES_IDS[currency];
  }

  const currencyData = currencies[currency];
  if (!currencyData) {
    throw new Error(`Currency ${currency} not found`);
  }

  // Standard pattern: DEX{CURRENCY}US for foreign/USD
  return `DEX${currency}US`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!FRED_API_KEY) {
    return NextResponse.json({ error: 'FRED API key not configured' }, { status: 500 });
  }

  if (!currency || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const seriesId = getSeriesId(currency);
    
    const url = new URL(FRED_BASE_URL);
    url.searchParams.append('series_id', seriesId);
    url.searchParams.append('api_key', FRED_API_KEY);
    url.searchParams.append('observation_start', startDate);
    url.searchParams.append('observation_end', endDate);
    url.searchParams.append('file_type', 'json');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch from FRED');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch exchange rates' 
    }, { status: 500 });
  }
} 