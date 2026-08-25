import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-800';

  switch (status.toUpperCase()) {
    case 'SUCCESS':
    case 'RECOVERED':
    case 'LOW':
      colorClasses = 'bg-green-100 text-green-800';
      break;
    case 'FAILED':
    case 'HIGH':
      colorClasses = 'bg-red-100 text-red-800';
      break;
    case 'ESCALATED':
      colorClasses = 'bg-orange-100 text-orange-800';
      break;
    case 'IN_PROGRESS':
    case 'OPEN':
      colorClasses = 'bg-blue-100 text-blue-800';
      break;
    case 'PENDING':
    case 'MEDIUM':
      colorClasses = 'bg-yellow-100 text-yellow-800';
      break;
    case 'IGNORED':
      colorClasses = 'bg-gray-200 text-gray-600';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colorClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
