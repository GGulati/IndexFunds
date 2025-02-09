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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface IndexChartProps {
  timeRange: TimeRange;
  selectedFunds: Fund[];
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export default function IndexChart({ timeRange, selectedFunds }: IndexChartProps) {
  const [chartData, setChartData] = useState<Record<string, ChartData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const promises = selectedFunds.map(fund => 
          getChartData(fund.symbol, timeRange)
        );
        const results = await Promise.all(promises);
        
        const newData = results.reduce((acc, data, index) => {
          acc[selectedFunds[index].symbol] = data;
          return acc;
        }, {} as Record<string, ChartData>);
        
        setChartData(newData);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
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
            const symbol = selectedFunds[context.datasetIndex].symbol;
            const fundData = chartData[symbol];
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, fundData.currency)}`;
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