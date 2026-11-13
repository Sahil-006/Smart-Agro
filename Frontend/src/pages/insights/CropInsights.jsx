import React from 'react';
import { FiImage, FiCalendar } from 'react-icons/fi';
import InsightCard from '@components/InsightCard';

const CropInsights = () => {
  // Sample crop scan history
  const scanHistory = [
    { date: 'Today', health: 78, diseaseRisk: 35 },
    { date: 'Yesterday', health: 82, diseaseRisk: 28 },
    { date: '2 days ago', health: 75, diseaseRisk: 40 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-28 sm:pt-36 pb-12 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 border-b border-green-200 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Crop Health Insights</h1>
          <p className="text-sm sm:text-base text-green-600">Detailed analysis of crop conditions and disease risks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status */}
          <InsightCard 
            title="Smart Disclosure" 
            icon={<FiImage className="text-green-600 shrink-0" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-600">Disease Risk</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-green-100 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-red-500 h-2.5 rounded-full" 
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">35%</span>
                </div>
                <p className="text-xs text-green-500 mt-1">35% risk detected</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Growth Stage</p>
                <p className="text-lg font-medium text-green-700">Vegetative</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Last Scan</p>
                <p className="text-lg font-medium text-green-700">3 hours ago</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-green-600 italic">
              "We can use our main system to create new and more efficient products."
            </p>
          </InsightCard>

          {/* Scan History */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-4 sm:mb-6">
              <FiCalendar className="text-green-600 mr-2 shrink-0" />
              Scan History
            </h2>
            
            <div className="overflow-x-auto w-full border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-green-200 text-left">
                <thead className="bg-green-50/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Health Score</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Disease Risk</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {scanHistory.map((scan, index) => (
                    <tr key={index} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{scan.date}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800 font-medium">{scan.health}/100</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-red-600 font-bold">{scan.diseaseRisk}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropInsights;
