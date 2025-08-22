import React from 'react';
import { FiSun, FiBattery, FiTrendingUp, FiCalendar } from 'react-icons/fi';
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-green-200 pb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Solar Energy Insights</h1>
          <p className="text-green-600">Detailed analysis of solar panel performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Performance */}
          <InsightCard 
            title="Main Optimizers" 
            icon={<FiSun className="text-yellow-600" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-green-600">Daily Production</p>
                <p className="text-2xl font-bold text-green-700">3.2kWh</p>
              </div>
              <div>
                <p className="text-green-600">Efficiency</p>
                <p className="text-2xl font-bold text-green-700">82%</p>
              </div>
              <div>
                <p className="text-green-600">Battery Level</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-green-100 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-green-600">75%</span>
                </div>
                <p className="text-sm text-green-500 mt-1">75% charged</p>
              </div>
            </div>
            <p className="mt-6 text-green-600 italic">
              "We've used our main system to create new and more efficient products."
            </p>
          </InsightCard>

          {/* Hourly Production */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold flex items-center text-green-700 mb-6">
              <FiTrendingUp className="text-green-600 mr-2" />
              Hourly Production
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Output (W)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-200">
                  {hourlyProduction.map((data, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{data.time}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{data.output}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{data.efficiency}%</td>
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