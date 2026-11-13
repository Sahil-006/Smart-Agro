import React from 'react';
import { FiSun, FiTrendingUp } from 'react-icons/fi';
import InsightCard from '@components/InsightCard';

const SolarInsights = () => {
  // Sample solar data
  const hourlyProduction = [
    { time: '6:00 AM', output: 320, efficiency: 78 },
    { time: '9:00 AM', output: 450, efficiency: 82 },
    { time: '12:00 PM', output: 520, efficiency: 85 },
    { time: '3:00 PM', output: 480, efficiency: 83 },
    { time: '6:00 PM', output: 380, efficiency: 79 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-28 sm:pt-36 pb-12 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 border-b border-green-200 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Solar Energy Insights</h1>
          <p className="text-sm sm:text-base text-green-600">Detailed analysis of solar panel performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Performance */}
          <InsightCard 
            title="Main Optimizers" 
            icon={<FiSun className="text-yellow-600 shrink-0" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-600">Daily Production</p>
                <p className="text-2xl font-bold text-green-700">3.2kWh</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Efficiency</p>
                <p className="text-2xl font-bold text-green-700">82%</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Battery Level</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-green-100 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">75%</span>
                </div>
                <p className="text-xs text-green-500 mt-1">75% charged</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-green-600 italic">
              "We've used our main system to create new and more efficient products."
            </p>
          </InsightCard>

          {/* Hourly Production */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-4 sm:mb-6">
              <FiTrendingUp className="text-green-600 mr-2 shrink-0" />
              Hourly Production
            </h2>
            
            <div className="overflow-x-auto w-full border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-green-200 text-left">
                <thead className="bg-green-50/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Time</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Output (W)</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {hourlyProduction.map((data, index) => (
                    <tr key={index} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.time}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800 font-medium">{data.output}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-green-700 font-bold">{data.efficiency}%</td>
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

export default SolarInsights;
