'use client';

import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getChartData, ChartData, TimeRange, convertExchangeTimestamp } from '@/services/data-fetcher';
import { getExchangeRate, getRateForDate } from '@/services/exchange-rates';
import { formatCurrency } from '@/utils/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDataWithRates extends ChartData {
  exchangeRates?: number[];  // Exchange rates for each timestamp
}

interface IndexChartProps {
  timeRange: TimeRange;
  selectedFunds: Fund[];
}

export default function IndexChart({ timeRange, selectedFunds }: IndexChartProps) {
  const [chartData, setChartData] = useState<Record<string, ChartData>>({});
  const [exchangeRates, setExchangeRates] = useState<Map<string, ExchangeRate[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const pricePromises = selectedFunds.map(fund => 
          getChartData(fund.symbol, timeRange)
        );
        const priceResults = await Promise.all(pricePromises);

        // Fetch exchange rates for non-USD currencies
        const nonUSDResults = priceResults.filter(result => result.currency !== 'USD');
        const ratePromises = nonUSDResults.map(result => getExchangeRate(result.currency));
        const rateResults = await Promise.all(ratePromises);

        // Create a map of currency to rates for easier lookup
        const currencyRates = new Map(
          nonUSDResults.map((result, index) => [result.currency, rateResults[index]])
        );

        // Combine price and rate data
        const newData = priceResults.reduce((acc, data, index) => {
          if (data.currency === 'USD') {
            acc[selectedFunds[index].symbol] = data;
          } else {
            const rates = currencyRates.get(data.currency);
            if (!rates) {
              console.error(`No rates found for ${data.currency}`);
              return acc;
            }
            
            acc[selectedFunds[index].symbol] = {
              ...data,
              close: data.close.map((price, i) => {
                const date = new Date(data.timestamp[i] * 1000)
                  .toISOString()
                  .split('T')[0];
                return price / getRateForDate(rates, date);
              })
            };
          }
          return acc;
        }, {} as Record<string, ChartData>);

        // Store exchange rates in state
        setExchangeRates(currencyRates);
        setChartData(newData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedFunds.length > 0) {
      fetchData();
    }
  }, [timeRange, selectedFunds]);

  if (error) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow-sm flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading || !Object.keys(chartData).length) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading chart data...</span>
        </div>
      </div>
    );
  }

  const dateFormat = getDateFormatForRange(timeRange);
  
  // Get all timestamps, normalized to UTC
  const allTimestamps = [...new Set(
    Object.entries(chartData).flatMap(([_, data]) => 
      data.timestamp.map(ts => convertExchangeTimestamp(ts, data.gmtOffset))
    )
  )].sort((a, b) => a - b);

  // Create a map of normalized timestamp to index
  const timestampToIndex = new Map(
    allTimestamps.map((ts, index) => [ts, index])
  );

  // Prepare datasets with aligned data points
  const datasets = selectedFunds.map(fund => {
    const fundData = chartData[fund.symbol];
    if (!fundData) return null;

    // Create an array filled with null values for all timestamps
    const alignedData = new Array(allTimestamps.length).fill(null);

    // Fill in the actual values where we have data
    fundData.timestamp.forEach((ts, i) => {
      const normalizedTs = convertExchangeTimestamp(ts, fundData.gmtOffset);
      const alignedIndex = timestampToIndex.get(normalizedTs);
      if (alignedIndex !== undefined) {
        alignedData[alignedIndex] = fundData.close[i];
      }
    });

    // Interpolate missing values
    let lastValue = null;
    for (let i = 0; i < alignedData.length; i++) {
      if (alignedData[i] === null) {
        alignedData[i] = lastValue;
      } else {
        lastValue = alignedData[i];
      }
    }

    return {
      label: fund.name,
      data: alignedData,
      borderColor: fund.color,
      backgroundColor: `${fund.color}10`,
      fill: false,
      tension: 0.4,
      pointRadius: timeRange === '1d' || timeRange === '5d' ? 1 : 0,
      borderWidth: 2,
      spanGaps: true,
    };
  }).filter(Boolean);

  const data = {
    labels: allTimestamps.map(ts => 
      new Date(ts * 1000).toLocaleDateString('en-US', dateFormat)
    ),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            if (context.parsed.y === null) return null;
            const fund = selectedFunds[context.datasetIndex];
            const fundData = chartData[fund.symbol];
            const value = context.parsed.y;

            if (fundData.currency === 'USD') {
              return `${fund.name}: ${formatCurrency(value, 'USD')}`;
            }

            // Get the original price by looking up the exchange rate
            const date = new Date(allTimestamps[context.dataIndex] * 1000)
              .toISOString()
              .split('T')[0];
            const rates = exchangeRates.get(fundData.currency);
            const rate = rates ? getRateForDate(rates, date) : 1;
            const localValue = value * rate;
            
            return [
              `${fund.name} (USD): ${formatCurrency(value, 'USD')}`,
              `${fund.name} (${fundData.currency}): ${formatCurrency(localValue, fundData.currency)}`,
              `Exchange Rate: 1 USD = ${rate.toFixed(4)} ${fundData.currency}`
            ];
          },
          title: (tooltipItems: any) => {
            const date = new Date(allTimestamps[tooltipItems[0].dataIndex] * 1000);
            return date.toLocaleString('en-US', {
              ...dateFormat,
              hour: timeRange === '1d' || timeRange === '5d' ? 'numeric' : undefined,
              minute: timeRange === '1d' || timeRange === '5d' ? 'numeric' : undefined,
            });
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: any) => {
            return formatCurrency(value, 'USD');
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow-sm">
      <Line data={data} options={options} />
    </div>
  );
}

function getDateFormatForRange(range: TimeRange): Intl.DateTimeFormatOptions {
  switch (range) {
    case '1d':
      return { hour: 'numeric', minute: 'numeric' };
    case '5d':
      return { weekday: 'short', hour: 'numeric' };
    case '1mo':
    case '6mo':
      return { month: 'short', day: 'numeric' };
    case 'ytd':
    case '1y':
      return { month: 'short', year: 'numeric' };
    case '5y':
    case 'max':
      return { year: 'numeric' };
    default:
      return { month: 'short', day: 'numeric' };
  }
} 