import { useState, useEffect } from 'react';
import { getExchangeRate, getHistoricalRates } from '@/services/exchange-rates';

export function useExchangeRates(fromCurrency: string, toCurrency: string, dates: string[]) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const uniqueDates = [...new Set(dates)];
        const ratePromises = uniqueDates.map(date => 
          getExchangeRate(fromCurrency, toCurrency, date)
        );
        
        const results = await Promise.all(ratePromises);
        const newRates = uniqueDates.reduce((acc, date, index) => {
          acc[date] = results[index];
          return acc;
        }, {} as Record<string, number>);
        
        setRates(newRates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
      } finally {
        setIsLoading(false);
      }
    }

    if (fromCurrency && toCurrency && dates.length > 0) {
      fetchRates();
    }
  }, [fromCurrency, toCurrency, dates.join(',')]);

  return { rates, isLoading, error };
} 