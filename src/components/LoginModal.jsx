// src/components/LoginModal.jsx - REVISI DENGAN GAMBAR LOGO
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose, onLoginSuccess, selectedLanguage }) => {
  const { login } = useAuth();

  const handleLogin = () => {
    login(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="w-full max-w-sm p-8 transition-all transform bg-white shadow-2xl rounded-xl relative">
        <div className="text-center">
          
          {/* ✅ CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute text-gray-400 transition-colors top-4 right-4 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* ✅ ICON DENGAN LOGO GAMBAR */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5  rounded-2xl">
                {/* GANTI DARI TEKS 'L' MENJADI GAMBAR LOGO */}
              <img 
                src="/images/lcode-logo.png" // PASTIKAN PATH LOGO KAMU BENAR
                alt="LCode Logo" 
                className="w-20 h-20 object-contain " // Sesuaikan ukuran dan tambahkan spin jika suka
              />
          </div>
          
          {/* ✅ TITLE */}
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900 font-poppins">
            Join LCode, Level Up!
          </h2>
          
          {/* ✅ DESCRIPTION */}
          {selectedLanguage ? (
            <p className="mb-6 text-gray-600 font-satoshi">
              Login to start <strong className="text-emerald-600">{selectedLanguage.name}</strong> and unlock all features!
            </p>
          ) : (
            <p className="mb-6 text-gray-600 font-satoshi">
              Access adaptive lessons, track your progress, and see your coding tree grow.
            </p>
          )}

          {/* ✅ FEATURES LIST - Lebih minimalis */}
          <div className="p-4 mb-6 space-y-3 text-left border-t border-b border-gray-100 font-satoshi">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-emerald-500">✅</span>
              <span className="text-gray-700">Interactive exercises</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-emerald-500">✅</span>
              <span className="text-gray-700">Progress tracking & XP</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-emerald-500">✅</span>
              <span className="text-gray-700">Badge collection</span>
            </div>
          </div>

          {/* ✅ LOGIN BUTTON (GOOGLE) */}
          <button
            onClick={handleLogin}
            className="flex items-center justify-center w-full py-3 mb-4 space-x-2 font-semibold text-white transition-all duration-300 bg-emerald-600 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 font-poppins"
          >
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* ✅ CLOSE BUTTON (Maybe Later) */}
          <button
            onClick={onClose}
            className="text-sm text-gray-500 transition-colors hover:text-emerald-700 font-satoshi"
          >
            Maybe later, let me explore first
          </button>

          {/* ✅ FOOTER NOTE */}
          <div className="p-3 mt-6 rounded-lg bg-emerald-50">
            <p className="text-xs text-emerald-700 font-satoshi">
              <strong>Free forever:</strong> No credit card required. Join 10,000+ learners!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;