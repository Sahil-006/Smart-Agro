import React from 'react';
import { FiAlertCircle, FiImage, FiSettings, FiSun } from 'react-icons/fi';

const InsightCard = ({ title, icon, children, className = '' }) => {
  // Map icon names to actual components
  const getIcon = () => {
    if (typeof icon === 'string') {
      switch(icon) {
        case 'alert': return <FiAlertCircle className="text-red-600" />;
        case 'image': return <FiImage className="text-green-600" />;
        case 'settings': return <FiSettings className="text-blue-600" />;
        case 'sun': return <FiSun className="text-yellow-600" />;
        default: return null;
      }
    }
    return icon;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all ${className}`}>
      <h2 className="text-xl font-semibold flex items-center text-green-700 mb-6">
        {getIcon() && <span className="mr-2">{getIcon()}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
};

export default InsightCard;