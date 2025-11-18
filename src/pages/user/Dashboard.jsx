// src/pages/user/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import LanguageCard from '../../components/LanguageCard';
import ProgressStats from '../../components/ProgressStats';

const Dashboard = () => {
  const [languages, setLanguages] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      const [languagesRes, progressRes] = await Promise.all([
        userAPI.languages.getAll(), // ✅ PASTIKAN METHOD NAME BENER
        userAPI.progress.get()
      ]);
      
      setLanguages(languagesRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load data. Please try again.');
      
      // Set default data jika error
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

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to LCode! 🚀</h1>
        <p className="text-gray-600">Continue your programming journey</p>
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