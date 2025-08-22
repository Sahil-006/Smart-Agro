import React from 'react';
import { FiAlertCircle, FiActivity, FiSettings } from 'react-icons/fi';
import InsightCard from '@components/InsightCard';



const SystemInsights = () => {
  // Sample system alerts
  const systemAlerts = [
    { id: 1, message: 'Low soil moisture detected in field A', time: '2 hours ago', critical: true },
    { id: 2, message: 'Rain expected in 6 hours', time: '4 hours ago', critical: false },
    { id: 3, message: 'Solar panel efficiency dropped 5%', time: '1 day ago', critical: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-green-200 pb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">System Insights</h1>
          <p className="text-green-600">Monitoring and alerts for your agro-solar system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Card */}
          <InsightCard 
            title="System Alerts" 
            icon={<FiAlertCircle className="text-red-600" />}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {systemAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${alert.critical ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}
                >
                  <p className="font-medium text-green-800">{alert.message}</p>
                  <p className="text-sm text-green-600 mt-1">{alert.time}</p>
                  {alert.critical && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                      Critical
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-2 border border-green-200 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
              View All Alerts
            </button>
          </InsightCard>

          {/* System Status */}
          <InsightCard 
            title="System Status" 
            icon={<FiSettings className="text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-600 mb-1">Overall Health</p>
                <p className="text-2xl font-bold text-green-700">Good</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-600 mb-1">Connected Devices</p>
                <p className="text-2xl font-bold text-blue-700">8/8</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-yellow-600 mb-1">Maintenance Required</p>
                <p className="text-2xl font-bold text-yellow-700">1</p>
              </div>
            </div>
          </InsightCard>
        </div>
      </div>
    </div>
  );
};

export default SystemInsights;