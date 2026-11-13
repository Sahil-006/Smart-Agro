import React from 'react';
import { FiDroplet, FiClock, FiCalendar } from 'react-icons/fi';

const SoilInsights = () => {
  // Sample historical data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    moisture: Math.floor(Math.random() * 20) + 60,
    temperature: Math.floor(Math.random() * 5) + 25,
    pH: (Math.random() * 0.5) + 6.5
  }));

  const dailyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    moisture: Math.floor(Math.random() * 15) + 60,
    temperature: Math.floor(Math.random() * 8) + 22,
    pH: (Math.random() * 0.8) + 6.3
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-28 sm:pt-36 pb-12 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 border-b border-green-200 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Soil Insights</h1>
          <p className="text-sm sm:text-base text-green-600">Detailed analysis of soil conditions over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Conditions */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 sm:p-6 lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-6">
              <FiDroplet className="text-green-600 mr-2 shrink-0" />
              Current Soil Status
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 mb-1">Moisture Level</p>
                <p className="text-2xl font-bold text-green-700">65%</p>
                <p className="text-xs sm:text-sm text-green-500 mt-1">Optimal range: 60-70%</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 mb-1">Temperature</p>
                <p className="text-2xl font-bold text-green-700">28°C</p>
                <p className="text-xs sm:text-sm text-green-500 mt-1">Ideal for crops</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 mb-1">pH Level</p>
                <p className="text-2xl font-bold text-green-700">6.8</p>
                <p className="text-xs sm:text-sm text-green-500 mt-1">Slightly acidic</p>
              </div>
            </div>
          </div>

          {/* Hourly Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-4 sm:mb-6">
              <FiClock className="text-green-600 mr-2 shrink-0" />
              Hourly Trends (Last 24 Hours)
            </h2>
            
            <div className="overflow-x-auto w-full border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-green-200 text-left">
                <thead className="bg-green-50/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Hour</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Moisture</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Temp</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">pH</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {hourlyData.map((data, index) => (
                    <tr key={index} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.hour}:00</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800 font-medium">{data.moisture}%</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.temperature}°C</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.pH.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 sm:p-6 lg:col-span-3">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-4 sm:mb-6">
              <FiCalendar className="text-green-600 mr-2 shrink-0" />
              Weekly Trends
            </h2>
            
            <div className="overflow-x-auto w-full border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-green-200 text-left">
                <thead className="bg-green-50/50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Day</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Avg Moisture</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Avg Temp</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Avg pH</th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-700 uppercase tracking-wider">Irrigation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {dailyData.map((data, index) => (
                    <tr key={index} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800 font-medium">{data.day}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.moisture}%</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.temperature}°C</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-800">{data.pH.toFixed(1)}</td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm text-green-700 font-bold">
                        {data.moisture < 65 ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 sm:p-6 lg:col-span-3">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-6">
              <FiDroplet className="text-blue-600 mr-2 shrink-0" />
              Irrigation Recommendations
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-600 font-medium mb-1 text-sm">Next Irrigation</p>
                <p className="text-xl font-bold text-blue-700">Tomorrow 6:00 AM</p>
                <p className="text-xs text-blue-500 mt-1">Based on current soil conditions</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-600 font-medium mb-1 text-sm">Optimal Duration</p>
                <p className="text-xl font-bold text-green-700">45 minutes</p>
                <p className="text-xs text-green-500 mt-1">For Field A (2.5 acres)</p>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 sm:col-span-2 md:col-span-1">
                <p className="text-teal-600 font-medium mb-1 text-sm">Water Savings</p>
                <p className="text-xl font-bold text-teal-700">~1200L</p>
                <p className="text-xs text-teal-500 mt-1">Predicted this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilInsights;
