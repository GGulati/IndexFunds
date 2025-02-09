'use client';

import { useState, useEffect } from 'react';
import IndexChart from '@/components/IndexChart';
import FundSelector from '@/components/FundSelector';
import FundDetails from '@/components/FundDetails';
import { getStockQuote, TimeRange, StockData } from '@/services/data-fetcher';
import { Fund } from '@/components/FundSelector';
import { getGlobalIndices } from '@/services/market-data';

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
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>([]);

  useEffect(() => {
    async function initializeData() {
      try {
        // Get list of indices and select S&P 500
        const indices = await getGlobalIndices();
        const spIndex = indices.find(index => index.symbol === '^GSPC');
        
        if (spIndex) {
          const initialFund: Fund = {
            ...spIndex,
            color: 'rgb(0, 150, 136)'
          };
          
          setSelectedFunds([initialFund]);
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    }
    
    initializeData();
  }, []);

  const handleFundToggle = (fund: Fund) => {
    setSelectedFunds(prev => {
      const exists = prev.some(f => f.symbol === fund.symbol);
      if (exists) {
        return prev.filter(f => f.symbol !== fund.symbol);
      }
      return [...prev, fund];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="container mx-auto px-4 max-w-6xl space-y-4">
        <FundSelector 
          selectedFunds={selectedFunds} 
          onFundToggle={handleFundToggle}
        />

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

        <IndexChart 
          timeRange={selectedRange}
          selectedFunds={selectedFunds}
        />
      </main>
    </div>
  );
}
