import React from 'react';
import { FiImage, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import InsightCard from '@components/InsightCard';



const CropInsights = () => {
  // Sample crop scan history
  const scanHistory = [
    { date: 'Today', health: 78, diseaseRisk: 35 },
    { date: 'Yesterday', health: 82, diseaseRisk: 28 },
    { date: '2 days ago', health: 75, diseaseRisk: 40 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-green-200 pb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Crop Health Insights</h1>
          <p className="text-green-600">Detailed analysis of crop conditions and disease risks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status */}
          <InsightCard 
            title="Smart Disclosure" 
            icon={<FiImage className="text-green-600" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-green-600">Disease Risk</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-green-100 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-red-500 h-2.5 rounded-full" 
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-green-600">35%</span>
                </div>
                <p className="text-sm text-green-500 mt-1">35% risk detected</p>
              </div>
              <div>
                <p className="text-green-600">Growth Stage</p>
                <p className="text-lg font-medium text-green-700">Vegetative</p>
              </div>
              <div>
                <p className="text-green-600">Last Scan</p>
                <p className="text-lg font-medium text-green-700">3 hours ago</p>
              </div>
            </div>
            <p className="mt-6 text-green-600 italic">
              "We can use our main system to create new and more efficient products."
            </p>
          </InsightCard>

          {/* Scan History */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold flex items-center text-green-700 mb-6">
              <FiCalendar className="text-green-600 mr-2" />
              Scan History
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Health Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Disease Risk</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-200">
                  {scanHistory.map((scan, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{scan.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{scan.health}/100</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{scan.diseaseRisk}%</td>
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