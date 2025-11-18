// src/components/ProgressStats.jsx
import React from 'react';

const ProgressStats = ({ progress }) => {
  const stats = [
    {
      label: 'Total EXP',
      value: progress?.total_exp || 0,
      icon: '⭐',
      color: 'yellow'
    },
    {
      label: 'Level',
      value: progress?.level || 1,
      icon: '📈',
      color: 'green'
    },
    {
      label: 'Parts Completed',
      value: progress?.completed_parts || 0,
      icon: '📚',
      color: 'blue'
    },
    {
      label: 'Exercises Done',
      value: progress?.completed_exercises || 0,
      icon: '💪',
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${
              stat.color === 'yellow' ? 'bg-yellow-100' :
              stat.color === 'green' ? 'bg-green-100' :
              stat.color === 'blue' ? 'bg-blue-100' :
              'bg-purple-100'
            }`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressStats;