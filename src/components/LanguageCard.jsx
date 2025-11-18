// src/components/LanguageCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LanguageCard = ({ language, progress }) => {
  // ✅ Hitung progress percentage (optional)
  const getProgressPercentage = () => {
    // Ini bisa dihitung dari total parts vs completed parts
    // Untuk sekarang, kita kasih dummy data dulu
    return Math.floor(Math.random() * 100); // Random progress untuk demo
  };

  const progressPercent = getProgressPercentage();

  return (
    <Link 
      to={`/language/${language.id}`}
      className="block p-6 transition-shadow duration-200 bg-white rounded-lg shadow hover:shadow-md"
    >
      {/* Header dengan Icon dan Title */}
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          {language.icon ? (
            <img 
              src={language.icon} 
              alt={language.name}
              className="w-8 h-8"
            />
          ) : (
            <span className="text-2xl">
              {language.name === 'Python' ? '🐍' :
               language.name === 'JavaScript' ? '📜' :
               language.name === 'C++' ? '⚡' :
               language.name === 'Java' ? '☕' : '💻'}
            </span>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-gray-900">{language.name}</h3>
          <p className="text-sm text-gray-500">
            {language.sections_count || 0} sections
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-gray-600 line-clamp-2">
        {language.description || `Learn ${language.name} programming language from basics to advanced.`}
      </p>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between mb-1 text-sm text-gray-600">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 transition-all duration-300 bg-green-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mt-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          language.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {language.is_active ? 'Available' : 'Coming Soon'}
        </span>
        
        <span className="text-sm text-gray-500">
          {progress?.completed_parts || 0} parts done
        </span>
      </div>
    </Link>
  );
};
export default LanguageCard;