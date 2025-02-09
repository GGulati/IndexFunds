import { NextResponse } from 'next/server';

// Data from Seeking Alpha's country ETFs table
const COUNTRY_ETFS = [
  // United States Major Indices
  { symbol: 'SPY', name: 'S&P 500 ETF', region: 'North America' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', region: 'North America' },
  { symbol: 'DIA', name: 'Dow Jones ETF', region: 'North America' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', region: 'North America' },
  
  // International ETFs
  { symbol: 'EWA', name: 'Australia ETF', region: 'Asia Pacific' },
  { symbol: 'EWO', name: 'Austria ETF', region: 'Europe' },
  { symbol: 'EWK', name: 'Belgium ETF', region: 'Europe' },
  { symbol: 'EWZ', name: 'Brazil ETF', region: 'Latin America' },
  { symbol: 'EWC', name: 'Canada ETF', region: 'North America' },
  { symbol: 'ECH', name: 'Chile ETF', region: 'Latin America' },
  { symbol: 'GXC', name: 'China ETF', region: 'Asia Pacific' },
  { symbol: 'GXG', name: 'Colombia ETF', region: 'Latin America' },
  { symbol: 'EDEN', name: 'Denmark ETF', region: 'Europe' },
  { symbol: 'EFNL', name: 'Finland ETF', region: 'Europe' },
  { symbol: 'EWQ', name: 'France ETF', region: 'Europe' },
  { symbol: 'EWG', name: 'Germany ETF', region: 'Europe' },
  { symbol: 'GREK', name: 'Greece ETF', region: 'Europe' },
  { symbol: 'EWH', name: 'Hong Kong ETF', region: 'Asia Pacific' },
  { symbol: 'PIN', name: 'India ETF', region: 'Asia Pacific' },
  { symbol: 'IDX', name: 'Indonesia ETF', region: 'Asia Pacific' },
  { symbol: 'EIRL', name: 'Ireland ETF', region: 'Europe' },
  { symbol: 'EIS', name: 'Israel ETF', region: 'Middle East' },
  { symbol: 'EWI', name: 'Italy ETF', region: 'Europe' },
  { symbol: 'EWJ', name: 'Japan ETF', region: 'Asia Pacific' },
  { symbol: 'KWT', name: 'Kuwait ETF', region: 'Middle East' },
  { symbol: 'EWM', name: 'Malaysia ETF', region: 'Asia Pacific' },
  { symbol: 'EWW', name: 'Mexico ETF', region: 'North America' },
  { symbol: 'EWN', name: 'Netherlands ETF', region: 'Europe' },
  { symbol: 'ENZL', name: 'New Zealand ETF', region: 'Asia Pacific' },
  { symbol: 'NORW', name: 'Norway ETF', region: 'Europe' },
  { symbol: 'EPU', name: 'Peru ETF', region: 'Latin America' },
  { symbol: 'EPHE', name: 'Philippines ETF', region: 'Asia Pacific' },
  { symbol: 'EPOL', name: 'Poland ETF', region: 'Europe' },
  { symbol: 'QAT', name: 'Qatar ETF', region: 'Middle East' },
  { symbol: 'EWS', name: 'Singapore ETF', region: 'Asia Pacific' },
  { symbol: 'EZA', name: 'South Africa ETF', region: 'Africa' },
  { symbol: 'EWY', name: 'South Korea ETF', region: 'Asia Pacific' },
  { symbol: 'EWP', name: 'Spain ETF', region: 'Europe' },
  { symbol: 'EWD', name: 'Sweden ETF', region: 'Europe' },
  { symbol: 'EWL', name: 'Switzerland ETF', region: 'Europe' },
  { symbol: 'EWT', name: 'Taiwan ETF', region: 'Asia Pacific' },
  { symbol: 'THD', name: 'Thailand ETF', region: 'Asia Pacific' },
  { symbol: 'TUR', name: 'Turkey ETF', region: 'Europe' },
  { symbol: 'UAE', name: 'United Arab Emirates ETF', region: 'Middle East' },
  { symbol: 'EWU', name: 'United Kingdom ETF', region: 'Europe' },
  { symbol: 'VNM', name: 'Vietnam ETF', region: 'Asia Pacific' }
];

export async function GET() {
  try {
    const indices = COUNTRY_ETFS.map(etf => ({
      ...etf,
      exchange: 'NYSE Arca',
      color: getRandomColor(etf.symbol)
    }));

    return NextResponse.json(indices);
  } catch (error) {
    console.error('Error preparing indices:', error);
    return NextResponse.json({ error: 'Failed to prepare indices' }, { status: 500 });
  }
}

function getRandomColor(symbol: string): string {
  // Use symbol to generate a consistent hue
  const hue = Array.from(symbol).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `hsl(${hue}, 65%, 45%)`; // Use HSL for consistent saturation and lightness
} 