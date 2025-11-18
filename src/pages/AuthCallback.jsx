// src/pages/AuthCallback.jsx - FINAL CLEAN VERSION
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedToken = urlParams.get('token');
    const errorFromUrl = urlParams.get('error');

    // Handle error from URL
    if (errorFromUrl) {
      navigate('/login?error=' + errorFromUrl);
      return;
    }

    // Handle token from URL
    if (encodedToken) {
      try {
        const decodedToken = decodeURIComponent(encodedToken);
        localStorage.setItem('auth_token', decodedToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/dashboard', { replace: true });
        return;
      } catch (error) {
        navigate('/login?error=token_error');
        return;
      }
    }

    // If no token but already logged in
    const existingToken = localStorage.getItem('auth_token');
    if (existingToken) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Really no authentication
    navigate('/login?error=no_authentication');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Completing login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;