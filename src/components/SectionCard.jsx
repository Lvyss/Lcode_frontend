// src/components/SectionCard.jsx - UPDATED
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PartDropdown from './PartDropdown';
import { userAPI } from '../services/api';

const SectionCard = ({ section, languageId, progress, onProgressUpdate }) => {
  const [showParts, setShowParts] = useState(false);
  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);

  // ✅ DEFAULT PROGRESS DATA JIKA TIDAK ADA
  const progressData = progress || {
    section_id: section.id,
    total_parts: 0,
    completed_parts: 0,
    progress_percentage: 0,
    section_completed: false
  };

  const toggleParts = async () => {
    if (showParts) {
      setShowParts(false);
      return;
    }

    // ✅ FETCH PARTS JIKA BELUM DIMUAT
    if (parts.length === 0) {
      setLoadingParts(true);
      try {
        const response = await userAPI.sections.getParts(section.id);
        setParts(response.data);
      } catch (error) {
        console.error('Failed to fetch parts:', error);
      } finally {
        setLoadingParts(false);
      }
    }
    setShowParts(true);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-xl">
      {/* ✅ SECTION HEADER WITH PROGRESS */}
      <div 
        className="p-6 transition-colors cursor-pointer hover:bg-gray-50"
        onClick={toggleParts}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2 space-x-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {section.name}
              </h3>
              
              {/* ✅ SECTION COMPLETION BADGE */}
              {progressData.section_completed && (
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  Completed
                </span>
              )}
            </div>
            
            <p className="mb-4 text-gray-600">{section.description}</p>
            
            {/* ✅ PROGRESS BAR */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progressData.progress_percentage)}`}
                  style={{ width: `${progressData.progress_percentage}%` }}
                ></div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {progressData.completed_parts}/{progressData.total_parts} parts
                </div>
                <div className="text-xs text-gray-500">
                  {progressData.progress_percentage}% complete
                </div>
              </div>
            </div>
          </div>
          
          {/* ✅ EXP REWARD & CHEVRON */}
          <div className="flex items-center ml-6 space-x-4">
            {section.exp_reward > 0 && (
              <div className="text-right">
                <div className="text-sm font-semibold text-yellow-600">
                  +{section.exp_reward} EXP
                </div>
                <div className="text-xs text-gray-500">Bonus</div>
              </div>
            )}
            
            <div className={`transform transition-transform ${showParts ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PARTS DROPDOWN */}
      {showParts && (
        <div className="border-t">
          {loadingParts ? (
            <div className="p-6 text-center">
              <div className="w-6 h-6 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-500">Loading parts...</p>
            </div>
          ) : (
            <PartDropdown 
              parts={parts} 
              sectionId={section.id}
              languageId={languageId}
              onPartComplete={onProgressUpdate} // ✅ REFRESH SECTION PROGRESS
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SectionCard;