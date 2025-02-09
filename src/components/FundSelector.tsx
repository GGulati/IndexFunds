'use client';

import { useEffect, useState } from 'react';
import { getGlobalIndices, MarketIndex } from '@/services/market-data';

export interface Fund extends MarketIndex {
  color: string;
}

interface FundSelectorProps {
  selectedFunds: Fund[];
  onFundToggle: (fund: Fund) => void;
}

export default function FundSelector({ selectedFunds, onFundToggle }: FundSelectorProps) {
  const [availableFunds, setAvailableFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const indices = await getGlobalIndices();
        setAvailableFunds(indices);
      } catch (error) {
        console.error('Failed to fetch indices:', error);
        setError('Failed to load available indices');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIndices();
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
      <h2 className="text-sm font-medium text-gray-600 mb-3">Compare Indices</h2>
      <div className="flex flex-wrap gap-2">
        {availableFunds.map((fund) => {
          const isSelected = selectedFunds.some(f => f.symbol === fund.symbol);
          return (
            <button
              key={fund.symbol}
              onClick={() => onFundToggle(fund)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                transition-colors duration-200
                ${isSelected 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: fund.color }}
              />
              {fund.name}
              <span className="text-xs text-gray-500">
                ({fund.region})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 