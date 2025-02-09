import { formatCurrency } from '@/utils/currency';

export interface FundDetailsProps {
  funds: Array<{
    name: string;
    symbol: string;
    previousClose: number;
    volume: number;
    weekLow: number;
    weekHigh: number;
    currency: string;
    usdRate?: number;  // Optional exchange rate to USD
  }>;
}

export default function FundDetails({ funds }: FundDetailsProps) {
  if (!funds || !funds.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 w-full mt-4">
      {funds.map(fund => (
        <div key={fund.symbol} className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-black">{fund.name}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm text-gray-600">Previous Close</h4>
              <p className="text-base font-semibold text-black">
                {formatCurrency(fund.previousClose, fund.currency)}
                {fund.usdRate && fund.currency !== 'USD' && (
                  <span className="block text-sm text-gray-500">
                    {formatCurrency(fund.previousClose / fund.usdRate, 'USD')}
                  </span>
                )}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-600">Volume</h4>
              <p className="text-base font-semibold text-black">
                {fund.volume.toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-600">52 Week Range</h4>
              <p className="text-base font-semibold text-black">
                {formatCurrency(fund.weekLow, fund.currency)} - {formatCurrency(fund.weekHigh, fund.currency)}
                {fund.usdRate && fund.currency !== 'USD' && (
                  <span className="block text-sm text-gray-500">
                    {formatCurrency(fund.weekLow / fund.usdRate, 'USD')} - {formatCurrency(fund.weekHigh / fund.usdRate, 'USD')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 