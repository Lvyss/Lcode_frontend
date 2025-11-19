// src/components/BadgeComponent.jsx
import React from 'react';

const BadgeComponent = ({ badge, showProgress = false, size = "medium" }) => {
  const sizeClasses = {
    small: "w-12 h-12 text-lg",
    medium: "w-16 h-16 text-xl",
    large: "w-24 h-24 text-2xl"
  };

  const colorClasses = {
    yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
    blue: "bg-blue-100 border-blue-300 text-blue-800",
    green: "bg-green-100 border-green-300 text-green-800",
    purple: "bg-purple-100 border-purple-300 text-purple-800",
    red: "bg-red-100 border-red-300 text-red-800",
    indigo: "bg-indigo-100 border-indigo-300 text-indigo-800"
  };

  const earnedClass = badge.earned ? "ring-2 ring-yellow-400 shadow-lg" : "opacity-70";

  return (
    <div className={`relative ${sizeClasses[size]} ${colorClasses[badge.color]} ${earnedClass} rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-105`}>
      {/* Badge Icon/Emoji */}
      <div className="text-center">
        {badge.icon_url ? (
          <img 
            src={badge.icon_url} 
            alt={badge.name}
            className="object-contain w-3/4 mx-auto h-3/4"
          />
        ) : (
          <span>{badge.icon_path}</span> // Fallback to emoji
        )}
      </div>

      {/* Progress Indicator */}
      {showProgress && !badge.earned && badge.progress_percentage > 0 && (
        <div className="absolute left-0 right-0 -bottom-1">
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 transition-all duration-500 bg-current rounded-full"
              style={{ width: `${badge.progress_percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute z-10 hidden px-2 py-1 mb-2 text-xs text-white bg-gray-900 rounded bottom-full group-hover:block whitespace-nowrap">
        <div className="font-semibold">{badge.name}</div>
        <div className="text-gray-300">{badge.description}</div>
        {showProgress && !badge.earned && (
          <div className="mt-1">
            Progress: {badge.progress.completed_parts}/{badge.required_parts} parts
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeComponent;