// src/components/BadgeModal.jsx - NEW COMPONENT
import React from 'react';

const BadgeModal = ({ isOpen, onClose, badges }) => {
  if (!isOpen || badges.length === 0) return null;

  const colorClasses = {
    yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
    blue: "bg-blue-100 border-blue-300 text-blue-800",
    green: "bg-green-100 border-green-300 text-green-800",
    purple: "bg-purple-100 border-purple-300 text-purple-800",
    red: "bg-red-100 border-red-300 text-red-800",
    indigo: "bg-indigo-100 border-indigo-300 text-indigo-800"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-8 mx-auto bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Congratulations!</h3>
          <p className="mt-2 text-gray-600">
            You've earned new {badges.length > 1 ? 'badges' : 'badge'}!
          </p>
        </div>

        {/* Badges List */}
        <div className="mb-6 space-y-4">
          {badges.map(badge => (
            <div 
              key={badge.id}
              className={`flex items-center p-4 rounded-lg border-2 ${colorClasses[badge.color]}`}
            >
              {/* Badge Icon */}
              <div className="flex items-center justify-center w-12 h-12 mr-4 bg-white border-2 rounded-full">
                {badge.icon_url ? (
                  <img 
                    src={badge.icon_url} 
                    alt={badge.name}
                    className="object-contain w-8 h-8"
                  />
                ) : (
                  <span className="text-lg">{badge.icon_path}</span>
                )}
              </div>
              
              {/* Badge Info */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold">{badge.name}</h4>
                <p className="text-sm opacity-80">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default BadgeModal;