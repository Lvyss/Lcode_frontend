// src/components/Leaderboard.jsx
import React from 'react';

const Leaderboard = ({ data = [] }) => {
  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-white text-gray-800 border-gray-200';
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈'; 
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getLevel = (exp) => {
    return Math.floor(exp / 1000) + 1;
  };

  // Jika data kosong, tampilkan placeholder
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">🏆</div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">No Leaderboard Data Yet</h3>
        <p className="text-gray-600">Be the first to complete exercises and climb the ranks!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Top Programmers</h2>
        <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
          {data.length} users
        </span>
      </div>

      {/* TOP 3 HIGHLIGHT */}
      {data.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
          {data.slice(0, 3).map((user, index) => (
            <div 
              key={user.id || index}
              className={`bg-gradient-to-br ${
                user.rank === 1 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
                user.rank === 2 ? 'from-gray-50 to-gray-100 border-gray-200' :
                'from-orange-50 to-orange-100 border-orange-200'
              } border rounded-xl p-4 text-center transform hover:scale-105 transition-transform duration-200`}
            >
              <div className="mb-2 text-2xl">{getRankIcon(user.rank)}</div>
              <div className="flex justify-center mb-3">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className={`w-16 h-16 rounded-full border-2 ${
                    user.rank === 1 ? 'border-yellow-300' :
                    user.rank === 2 ? 'border-gray-300' :
                    'border-orange-300'
                  }`}
                />
              </div>
              <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
              <div className="flex items-center justify-center mt-2 space-x-2">
                <span className="text-sm text-gray-600">Level {getLevel(user.exp)}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-sm font-semibold text-indigo-600">{user.exp} EXP</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL LEADERBOARD LIST */}
      <div className="space-y-3">
        {data.map((user, index) => (
          <div 
            key={user.id || index}
            className={`flex items-center justify-between p-4 border rounded-lg ${getRankColor(user.rank)} hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center flex-1 space-x-4">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                user.rank <= 3 ? 'text-lg' : 'text-sm bg-gray-100'
              }`}>
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar & Name */}
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 border-2 border-white rounded-full shadow-sm"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                <p className="text-sm text-gray-500">Level {getLevel(user.exp)}</p>
              </div>
            </div>

            {/* EXP */}
            <div className="text-right">
              <p className="font-bold text-gray-900">{user.exp} EXP</p>
              <p className="text-xs text-gray-500">Rank #{user.rank}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CURRENT USER POSITION (BONUS) */}
      {data.length > 10 && (
        <div className="pt-6 mt-8 border-t border-gray-200">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Your Position</h3>
          <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-indigo-600 rounded-full">
                  {data.findIndex(u => u.isCurrentUser) + 1 || data.length + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">You</p>
                  <p className="text-sm text-gray-600">
                    {data.find(u => u.isCurrentUser)?.exp || 0} EXP • 
                    Level {getLevel(data.find(u => u.isCurrentUser)?.exp || 0)}
                  </p>
                </div>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                View Full Profile →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;