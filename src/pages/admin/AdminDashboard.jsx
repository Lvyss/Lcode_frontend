// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.dashboard.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your LCode learning platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats?.total_users || 0} 
          icon="👥" 
          color="blue"
        />
        <StatCard 
          title="Languages" 
          value={stats?.total_languages || 0} 
          icon="💻" 
          color="green"
        />
        <StatCard 
          title="Sections" 
          value={stats?.total_sections || 0} 
          icon="📚" 
          color="purple"
        />
        <StatCard 
          title="Parts" 
          value={stats?.total_parts || 0} 
          icon="📖" 
          color="yellow"
        />
        <StatCard 
          title="Exercises" 
          value={stats?.total_exercises || 0} 
          icon="🎯" 
          color="red"
        />
        <StatCard 
          title="Badges" 
          value={stats?.total_badges || 0} 
          icon="🏆" 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminCard 
              title="Manage Languages"
              description="Add programming languages"
              icon="💻"
              link="/admin/languages"
              color="blue"
            />
            <AdminCard 
              title="Manage Sections"
              description="Organize learning sections"
              icon="📚"
              link="/admin/sections"
              color="green"
            />
            <AdminCard 
              title="Manage Parts"
              description="Create learning parts"
              icon="📖"
              link="/admin/parts"
              color="purple"
            />
            <AdminCard 
              title="Manage Exercises"
              description="Create coding exercises"
              icon="🎯"
              link="/admin/exercises"
              color="yellow"
            />
            <AdminCard 
              title="Manage Badges"
              description="Design achievements"
              icon="🏆"
              link="/admin/badges"
              color="red"
            />
            <AdminCard 
              title="User Dashboard"
              description="View as student"
              icon="👨‍🎓"
              link="/dashboard"
              color="indigo"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Users</h2>
          <div className="space-y-4">
            {stats?.recent_users?.map(user => (
              <div key={user.id} className="flex items-center space-x-3">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Languages */}
      <div className="p-6 mt-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Popular Languages</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats?.popular_languages?.map(language => (
            <div key={language.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <span className="text-lg">💻</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{language.name}</h3>
                  <p className="text-sm text-gray-500">{language.user_progress_count} learners</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Admin Card Component
const AdminCard = ({ title, description, icon, link, color }) => {
  const colorClasses = {
    blue: 'border-blue-200 hover:bg-blue-50',
    green: 'border-green-200 hover:bg-green-50',
    purple: 'border-purple-200 hover:bg-purple-50',
    yellow: 'border-yellow-200 hover:bg-yellow-50',
    red: 'border-red-200 hover:bg-red-50',
    indigo: 'border-indigo-200 hover:bg-indigo-50'
  };

  return (
    <Link 
      to={link}
      className={`block p-4 border-2 rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default AdminDashboard;