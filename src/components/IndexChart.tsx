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
import { getChartData, ChartData, TimeRange } from '@/services/data-fetcher';

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
}

export default function IndexChart({ timeRange }: IndexChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getChartData('^GSPC', timeRange);
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  if (error) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow-sm flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading || !chartData) {
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
  
  const data = {
    labels: chartData.timestamp.map(ts => 
      new Date(ts * 1000).toLocaleDateString('en-US', dateFormat)
    ),
    datasets: [
      {
        label: 'S&P 500',
        data: chartData.close,
        borderColor: 'rgb(0, 150, 136)',
        backgroundColor: 'rgba(0, 150, 136, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: timeRange === '1d' || timeRange === '5d' ? 1 : 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString()}`,
          title: (tooltipItems: any) => {
            const date = new Date(chartData.timestamp[tooltipItems[0].dataIndex] * 1000);
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
          callback: (value: any) => `$${value.toLocaleString()}`,
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