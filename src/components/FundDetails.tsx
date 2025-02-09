interface FundDetailsProps {
  previousClose: number;
  volume: number;
  weekLow: number;
  weekHigh: number;
}

export default function FundDetails({ previousClose, volume, weekLow, weekHigh }: FundDetailsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full mt-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm text-gray-600">Previous Close</h3>
        <p className="text-lg font-semibold text-black">${previousClose.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm text-gray-600">Volume</h3>
        <p className="text-lg font-semibold text-black">{volume.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm text-gray-600">52 Week Range</h3>
        <p className="text-lg font-semibold text-black">
          ${weekLow.toLocaleString()} - ${weekHigh.toLocaleString()}
        </p>
      </div>
    </div>
  );
} 