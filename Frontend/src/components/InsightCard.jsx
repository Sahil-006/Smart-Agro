import React from 'react';
import { FiAlertCircle, FiImage, FiSettings, FiSun } from 'react-icons/fi';

const InsightCard = ({ title, icon, children, className = '' }) => {
  // Map icon names to actual components
  const getIcon = () => {
    if (typeof icon === 'string') {
      switch(icon) {
        case 'alert': return <FiAlertCircle className="text-red-600 shrink-0" />;
        case 'image': return <FiImage className="text-green-600 shrink-0" />;
        case 'settings': return <FiSettings className="text-blue-600 shrink-0" />;
        case 'sun': return <FiSun className="text-yellow-600 shrink-0" />;
        default: return null;
      }
    }
    return icon;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-green-100 p-5 sm:p-6 hover:shadow-md transition-all ${className}`}>
      <h2 className="text-lg sm:text-xl font-semibold flex items-center text-green-700 mb-4 sm:mb-6">
        {getIcon() && <span className="mr-2 shrink-0">{getIcon()}</span>}
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );
};

export default InsightCard;
