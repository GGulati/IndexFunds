import { NextRequest } from 'next/server';

const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range');
  const interval = searchParams.get('interval');

  if (!symbol) {
    return new Response('Symbol is required', { status: 400 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/chart/${symbol}?range=${range || '1d'}&interval=${interval || '1d'}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from Yahoo Finance');
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
    return new Response('Failed to fetch data', { status: 500 });
  }
} 