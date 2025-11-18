// src/pages/Login.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth(); // TAMBAH loading di sini

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Code2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-indigo-600">Lcode</span>
          </h1>
          <p className="text-gray-600">
            Learn coding through interactive challenges and grow your skills tree!
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-green-500 mr-2" />
            Interactive coding exercises
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-green-500 mr-2" />
            Grow your programming skills tree
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-green-500 mr-2" />
            Earn badges and track progress
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={login}
          disabled={loading} // TAMBAH disabled state
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              Redirecting...
            </>
          ) : (
            <>
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              Continue with Google
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;