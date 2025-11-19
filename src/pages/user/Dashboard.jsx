// src/pages/user/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // ✅ IMPORT USE AUTH
import { useNavigate } from 'react-router-dom'; // ✅ IMPORT NAVIGATE
import LanguageCard from '../../components/LanguageCard';
import ProgressStats from '../../components/ProgressStats';

const Dashboard = () => {
  const [languages, setLanguages] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ HOOKS BARU
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      const [languagesRes, progressRes] = await Promise.all([
        userAPI.languages.getAll(),
        userAPI.progress.get()
      ]);
      
      setLanguages(languagesRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load data. Please try again.');
      
      setProgress({
        total_exp: 0,
        level: 1,
        completed_parts: 0,
        completed_exercises: 0,
        streak: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCTION UNTUK KE PROFILE
  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* HEADER SECTION WITH PROFILE BUTTON */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to LCode! 🚀
          </h1>
          <p className="text-gray-600">
            {user?.name ? `Hello, ${user.name}! Continue your programming journey` : 'Continue your programming journey'}
          </p>
        </div>
        

{/* ✅ UPDATE EXP REFERENCE */}
<button
  onClick={handleProfileClick}
  className="flex items-center px-4 py-3 space-x-3 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md"
>
  <div className="flex items-center space-x-2">
    <img 
      src={user?.avatar || '/default-avatar.png'} 
      alt="Profile"
      className="w-8 h-8 border-2 border-indigo-100 rounded-full"
    />
    <div className="text-left">
      <p className="text-sm font-medium text-gray-900">
        View Profile
      </p>
      {/* ✅ PAKE total_exp BUKAN exp */}
      <p className="text-xs text-gray-500">
        {progress?.total_exp || 0} EXP • Level {progress?.level || 1}
      </p>
    </div>
  </div>
  <svg 
    className="w-5 h-5 text-gray-400" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 5l7 7-7 7" 
    />
  </svg>
</button>
      </div>

      {/* Progress Stats */}
      <ProgressStats progress={progress} />
      
      {/* Languages Grid */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Programming Languages</h2>
          <span className="text-gray-500">{languages.length} languages available</span>
        </div>

        {languages.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow">
            <div className="mb-4 text-6xl">💻</div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No languages yet</h3>
            <p className="text-gray-600">Languages will be available soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {languages.map(language => (
              <LanguageCard 
                key={language.id} 
                language={language} 
                progress={progress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;