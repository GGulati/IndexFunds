import { NextResponse } from 'next/server';

// Combined data from Yahoo Finance and Trading Economics
const WORLD_INDICES = [
  // Americas
  { symbol: '^GSPC', name: 'S&P 500', region: 'North America' },
  { symbol: '^DJI', name: 'Dow Jones', region: 'North America' },
  { symbol: '^IXIC', name: 'NASDAQ', region: 'North America' },
  { symbol: '^RUT', name: 'Russell 2000', region: 'North America' },
  { symbol: '^GSPTSE', name: 'S&P/TSX', region: 'North America' },
  { symbol: '^BVSP', name: 'IBOVESPA', region: 'Latin America' },
  { symbol: '^MXX', name: 'IPC Mexico', region: 'Latin America' },
  { symbol: '^MERV', name: 'MERVAL', region: 'Latin America' },
  { symbol: '^IPSA', name: 'IPSA Chile', region: 'Latin America' },
  
  // Europe
  { symbol: '^FTSE', name: 'FTSE 100', region: 'Europe' },
  { symbol: '^GDAXI', name: 'DAX 40', region: 'Europe' },
  { symbol: '^FCHI', name: 'CAC 40', region: 'Europe' },
  { symbol: '^STOXX50E', name: 'Euro Stoxx 50', region: 'Europe' },
  { symbol: '^AEX', name: 'AEX', region: 'Europe' },
  { symbol: '^IBEX', name: 'IBEX 35', region: 'Europe' },
  { symbol: '^SSMI', name: 'SMI', region: 'Europe' },
  { symbol: '^PTL', name: 'WIG 20', region: 'Europe' },
  { symbol: '^BFX', name: 'BEL 20', region: 'Europe' },
  { symbol: 'IMOEX.ME', name: 'MOEX', region: 'Europe' },
  { symbol: '^OMXC25', name: 'OMX Copenhagen', region: 'Europe' },
  { symbol: '^OMXS30', name: 'OMX Stockholm', region: 'Europe' },
  { symbol: '^OMXH25', name: 'OMX Helsinki', region: 'Europe' },
  
  // Asia Pacific
  { symbol: '^N225', name: 'Nikkei 225', region: 'Asia Pacific' },
  { symbol: '^HSI', name: 'Hang Seng', region: 'Asia Pacific' },
  { symbol: '000001.SS', name: 'Shanghai', region: 'Asia Pacific' },
  { symbol: '399001.SZ', name: 'Shenzhen', region: 'Asia Pacific' },
  { symbol: '^STI', name: 'STI', region: 'Asia Pacific' },
  { symbol: '^AXJO', name: 'ASX 200', region: 'Asia Pacific' },
  { symbol: '^BSESN', name: 'SENSEX', region: 'Asia Pacific' },
  { symbol: '^NSEI', name: 'NIFTY 50', region: 'Asia Pacific' },
  { symbol: '^JKSE', name: 'Jakarta', region: 'Asia Pacific' },
  { symbol: '^KS11', name: 'KOSPI', region: 'Asia Pacific' },
  { symbol: '^TWII', name: 'TAIEX', region: 'Asia Pacific' },
  { symbol: '^NZ50', name: 'NZX 50', region: 'Asia Pacific' },
  { symbol: '^KLSE', name: 'KLCI', region: 'Asia Pacific' },
  { symbol: '^SET.BK', name: 'SET', region: 'Asia Pacific' },
  
  // Middle East & Africa
  { symbol: '^TA125.TA', name: 'TA-125', region: 'Middle East' },
  { symbol: '^TASI.SR', name: 'TASI', region: 'Middle East' },
  { symbol: '^CASE30', name: 'EGX 30', region: 'Africa' },
  { symbol: '^JN0U.JO', name: 'JSE Top 40', region: 'Africa' },
];

export async function GET() {
  try {
    const indices = WORLD_INDICES.map(index => ({
      ...index,
      exchange: 'Index',
      color: getRandomColor(index.symbol)
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