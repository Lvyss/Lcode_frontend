// src/components/Leaderboard.jsx - DESAIN CLEAN & SOFT
import React from 'react';
// Import ikon baru untuk Top 3 (Crown, Zap, Feather)
import { Crown, Zap, Feather, User } from 'lucide-react'; 

const Leaderboard = ({ data = [] }) => {
  
  // Fungsi untuk mendapatkan warna background LIST ITEM
  const getListItemColor = (rank) => {
    switch(rank) {
      // ✅ Soft Highlight untuk Top 3 di list: Menggunakan warna EMERALD / Hijau muda
      case 1: return 'bg-emerald-50 border-emerald-200'; 
      case 2:
      case 3: return 'bg-gray-50 border-gray-200';
      default: return 'bg-white border-gray-100'; // Default sangat clean
    }
  };

  // Fungsi untuk mendapatkan ikon (Menggunakan Lucide-React)
  const getRankIconComponent = (rank) => {
    const defaultStyle = "w-4 h-4";
    switch(rank) {
      case 1: return <Crown className={`text-emerald-500 ${defaultStyle}`} />;
      case 2: return <Zap className={`text-gray-500 ${defaultStyle}`} />;
      case 3: return <Feather className={`text-gray-400 ${defaultStyle}`} />;
      default: return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };
  
  // Fungsi untuk mendapatkan ikon EMAS/SILVER/PERUNGGU (kecil di atas avatar)
  const getAvatarBadge = (rank) => {
    switch(rank) {
        case 1: return '🥇'; // Emas
        case 2: return '🥈'; // Perak
        case 3: return '🥉'; // Perunggu
        default: return null;
    }
  }

  const getLevel = (exp) => {
    return Math.floor(exp / 1000) + 1;
  };

  if (data.length === 0) {
    // ... (placeholder tetap sama)
     return (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🏆</div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Leaderboard Data Yet</h3>
          <p className="text-gray-600">Be the first to complete exercises and climb the ranks!</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900">Top Programmers</h2>
        <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
          {data.length} users ranked
        </span>
      </div>

      {/* TOP 3 HIGHLIGHT CARD - Lebih Clean dan Warna Emerald */}
      {data.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          {data.slice(0, 3).map((user, index) => (
            <div 
              key={user.id || index}
              className={`
                border rounded-2xl p-6 text-center shadow-lg transition-shadow duration-300
                ${
                  user.rank === 1 ? 'bg-gradient-to-br from-white to-emerald-50 border-emerald-300 shadow-emerald-100/50' :
                  user.rank === 2 ? 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-gray-100/50' :
                  'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-gray-100/50'
                }
                transform hover:scale-[1.02] hover:shadow-xl
              `}
            >
              <div className="relative flex justify-center mb-3">
                
                {/* 🌟 ICON BESAR */}
                <div className="absolute z-10 text-3xl -top-6">
                    {getAvatarBadge(user.rank)}
                </div>

                {/* AVATAR */}
                <img 
                  src={user.avatar || 'https://via.placeholder.com/64?text=U'} // Tambahkan fallback avatar
                  alt={user.name}
                  className={`
                    w-20 h-20 rounded-full border-4 shadow-md
                    ${
                      user.rank === 1 ? 'border-emerald-500' :
                      user.rank === 2 ? 'border-gray-400' :
                      'border-gray-300'
                    }
                  `}
                />
              </div>

              <h3 className="mt-3 text-xl font-extrabold text-gray-900 truncate">{user.name}</h3>
              <div className="flex items-center justify-center mt-2 space-x-3">
                <span className="text-base font-semibold text-gray-600">Level {getLevel(user.exp)}</span>
                <span className="text-xs text-gray-300">•</span>
                {/* EXP di Top 3 menggunakan warna Emerald agar menonjol */}
                <span className="text-base font-extrabold text-emerald-600">{user.exp} EXP</span> 
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL LEADERBOARD LIST - Lebih Sederhana */}
      <div className="space-y-2">
        {data.map((user, index) => (
          <div 
            key={user.id || index}
            // ✅ Menggunakan warna soft highlight dari getListItemColor
            className={`flex items-center justify-between p-4 border rounded-xl 
              ${getListItemColor(user.rank)} 
              shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center flex-1 space-x-4">
              
              {/* RANK IKON/NOMOR */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${user.rank <= 3 ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'}
              `}>
                {getRankIconComponent(user.rank)}
              </div>

              {/* Avatar & Name */}
              <img 
                src={user.avatar || 'https://via.placeholder.com/40?text=U'} // Tambahkan fallback avatar
                alt={user.name}
                className="w-10 h-10 border-2 border-white rounded-full shadow-sm"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                <p className="text-sm text-gray-500">Level {getLevel(user.exp)}</p>
              </div>
            </div>

            {/* EXP */}
            <div className="text-right">
              <p className="text-lg font-extrabold text-gray-900">{user.exp} EXP</p>
              <p className="text-xs font-semibold text-gray-500">Rank #{user.rank}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CURRENT USER POSITION (BONUS) - Tetap menggunakan Indigo agar menonjol sebagai "Anda" */}
      {/* ... (bagian ini tetap sama) ... */}
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