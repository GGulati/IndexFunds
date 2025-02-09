const BASE_URL = '/api/history';

export interface StockData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
  previousClose: number;
  volume: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
}

export interface ChartData {
  timestamp: number[];
  close: number[];
  volume: number[];
  gmtOffset: number;
  currency: string;
}

export type TimeRange = '1d' | '5d' | '1mo' | '6mo' | 'ytd' | '1y' | '5y' | '10y' | '20y' | 'max';

export function convertExchangeTimestamp(timestamp: number, gmtOffset: number): number {
  // Convert timestamp to UTC by subtracting the exchange's GMT offset
  return timestamp - gmtOffset;
}

async function calculate52WeekRange(symbol: string): Promise<{ low: number; high: number }> {
  const response = await fetch(
    `${BASE_URL}?symbol=${symbol}&range=1d&interval=1d`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch 52-week data');
  }

  const data = await response.json();
  const quote = data.chart.result[0].meta;
  
  return {
    low: quote.fiftyTwoWeekLow,
    high: quote.fiftyTwoWeekHigh
  };
}

export async function getStockQuote(symbol: string): Promise<StockData> {
  const [quoteResponse, rangeData] = await Promise.all([
    fetch(`${BASE_URL}?symbol=${symbol}&range=1d&interval=1d`),
    calculate52WeekRange(symbol)
  ]);
  
  if (!quoteResponse.ok) {
    throw new Error('Failed to fetch stock data');
  }

  const data = await quoteResponse.json();
  const result = data.chart.result[0];
  const quote = result.meta;
  
  return {
    symbol: quote.symbol || symbol,
    currentPrice: quote.regularMarketPrice,
    change: quote.regularMarketPrice - quote.chartPreviousClose,
    changePercent: ((quote.regularMarketPrice - quote.chartPreviousClose) / quote.chartPreviousClose) * 100,
    lastUpdated: quote.regularMarketTime,
    previousClose: quote.chartPreviousClose,
    volume: quote.regularMarketVolume,
    fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh
  };
}

export async function getChartData(symbol: string, range: TimeRange): Promise<ChartData> {
  const interval = getIntervalForRange(range);
  
  const response = await fetch(
    `${BASE_URL}?symbol=${symbol}&range=${range}&interval=${interval}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }

  const data = await response.json();
  const result = data.chart.result[0];
  
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  const closes = quotes.close;
  const volumes = quotes.volume;

  // Create paired arrays removing any points with null values
  const validPoints = timestamps.reduce((acc: ChartData, timestamp: number, index: number) => {
    const price = closes[index];
    if (price !== null && !isNaN(price)) {
      acc.timestamp.push(timestamp);
      acc.close.push(price);
      acc.volume.push(volumes[index] ?? 0);  // Use 0 if volume is null
    }
    return acc;
  }, { 
    timestamp: [], 
    close: [], 
    volume: [],
    gmtOffset: result.meta.gmtoffset,
    currency: result.meta.currency || 'USD'  // Default to USD if not specified
  });

  return validPoints;
}

function getIntervalForRange(range: TimeRange): string {
  switch (range) {
    case '1d':
      return '5m';
    case '5d':
      return '15m';
    case '1mo':
      return '1d';
    case '6mo':
      return '1d';
    case 'ytd':
      return '1d';
    case '1y':
      return '1d';
    case '5y':
      return '1wk';
    case 'max':
      return '1mo';
    default:
      return '1d';
  }
} 