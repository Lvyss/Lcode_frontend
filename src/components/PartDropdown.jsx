// src/components/PartDropdown.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';

const PartDropdown = ({ parts, sectionId, languageId }) => {
  const [partProgress, setPartProgress] = useState({});

  // ✅ FETCH PROGRESS UNTUK SETIAP PART
  useEffect(() => {
    parts.forEach(part => {
      fetchPartProgress(part.id);
    });
  }, [parts]);

  const fetchPartProgress = async (partId) => {
    try {
      const response = await userAPI.progress.getPartProgress(partId);
      setPartProgress(prev => ({
        ...prev,
        [partId]: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch part progress:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="border rounded-lg">
      {parts.map(part => {
        const progress = partProgress[part.id] || {};
        const percentage = progress.progress_percentage || 0;
        const isCompleted = progress.part_completed || false;

        return (
          <Link 
            key={part.id}
            to={`/part/${part.id}`}
            className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{part.title}</h4>
                {isCompleted && (
                  <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{part.description}</p>
              
              {/* Progress Bar */}
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-12">
                  {progress.completed_exercises || 0}/{progress.total_exercises || 0}
                </span>
              </div>
            </div>
            
            <div className="ml-4 text-sm text-gray-500 text-right">
              <div>{part.exp_reward} EXP</div>
              <div className="text-xs">{percentage}%</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PartDropdown;