'use client';

import { useState, useEffect } from 'react';
import IndexChart from '@/components/IndexChart';
import FundDetails from '@/components/FundDetails';
import { getStockQuote, TimeRange, StockData } from '@/services/data-fetcher';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '6M', value: '6mo' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'All', value: 'max' },
];

export default function Home() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1y');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStockData() {
      try {
        const data = await getStockQuote('^GSPC');
        setStockData(data);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStockData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-7xl mx-auto text-black">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">S&P 500 (^GSPC)</h1>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-black">
              {isLoading ? (
                'Loading...'
              ) : (
                `$${stockData?.currentPrice.toLocaleString()}`
              )}
            </span>
            {!isLoading && stockData && (
              <>
                <span className={`font-medium ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
                <span className="text-gray-600">
                  At close: {new Date(stockData.lastUpdated * 1000).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short'
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          {TIME_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedRange(value)}
              className={`px-3 py-1 rounded-full text-sm 
                ${selectedRange === value 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-900 hover:bg-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {label}
            </button>
          ))}
        </div>

        <IndexChart timeRange={selectedRange} />
        {!isLoading && stockData && (
          <FundDetails 
            previousClose={stockData.previousClose}
            volume={stockData.volume}
            weekLow={stockData.fiftyTwoWeekLow}
            weekHigh={stockData.fiftyTwoWeekHigh}
          />
        )}
      </main>
    </div>
  );
}
