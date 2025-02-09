import { NextResponse } from 'next/server';
import { getCountryFromCurrency } from '@/utils/currency';

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

async function findSeriesId(currency: string): Promise<string> {
  const countrySearch = getCountryFromCurrency(currency)?.name ?? currency;

  const searchUrl = new URL(`${FRED_BASE_URL}/series/search`);
  searchUrl.searchParams.append('api_key', FRED_API_KEY!);
  searchUrl.searchParams.append('file_type', 'json');
  searchUrl.searchParams.append('search_text', `Currency Conversions USD for ${countrySearch}`);

  console.log(searchUrl.toString());
  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error('Failed to search FRED series');
  }

  const data = await response.json();
  const series = data.seriess?.[0];
  
  if (!series?.id) {
    throw new Error(`No exchange rate series found for ${currency}`);
  }

  return series.id;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get('currency');

  if (!FRED_API_KEY) {
    return NextResponse.json({ error: 'FRED API key not configured' }, { status: 500 });
  }

  if (!currency) {
    return NextResponse.json({ error: 'Missing currency parameter' }, { status: 400 });
  }

  try {
    const seriesId = await findSeriesId(currency);
    
    const url = new URL(`${FRED_BASE_URL}/series/observations`);
    url.searchParams.append('series_id', seriesId);
    url.searchParams.append('api_key', FRED_API_KEY);
    url.searchParams.append('file_type', 'json');

    console.log(url.toString());
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