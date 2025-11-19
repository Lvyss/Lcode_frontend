// src/contexts/AuthContext.jsx - SIMPLIFY!
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/contexts/AuthContext.jsx - UPDATE
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔍 AuthContext - Checking auth with token:', token ? 'YES' : 'NO');
      
      if (!token) {
        console.log('⚠️ No token found in AuthContext');
        setLoading(false);
        return;
      }
      
      const response = await authAPI.getUser();
      const userData = response.data;
      console.log('✅ AuthContext - User data:', userData);
      
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
    } catch (error) {
      console.error('❌ AuthContext - Auth check failed:', error);
      if (error.response?.status === 401) {
        console.log('🔐 Token invalid, clearing...');
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // window.location.href = 'http://localhost:8000/oauth/google';
    indow.location.href = 'http://lcode.infinityfreeapp.com/oauth/google';
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};