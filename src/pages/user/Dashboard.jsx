// src/pages/user/Dashboard.jsx - UPDATE BESAR (ZIGZAG BG DENGAN 3 LAYER)
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Components Baru
import Navbar from '../../components/Navbar';
import HeroSection from '../../components/HeroSection';
import Leaderboard from '../../components/Leaderboard';
import LanguageCard from '../../components/LanguageCard';
import LoginModal from '../../components/LoginModal';
import Footer from '../../components/Footer';
const Dashboard = () => {
  const [languages, setLanguages] = useState([]);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [languagesRes, leaderboardRes, progressRes] = await Promise.all([
        userAPI.languages.getAll(),
        userAPI.leaderboard.get(),
        user ? userAPI.progress.get() : Promise.resolve(null),
      ]);
      
      setLanguages(languagesRes.data);
      setLeaderboard(leaderboardRes.data);
      
      if (user && progressRes) {
        setProgress(progressRes.data);
      } else {
        setProgress({
          total_exp: 0,
          level: 1,
          completed_parts: 0,
          completed_exercises: 0,
          streak: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLanguages([]);
      setLeaderboard([]);
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

  const handleLanguageClick = (language) => {
    if (user) {
      navigate(`/language/${language.id}`);
    } else {
      setSelectedLanguage(language);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- START RETURN ---
  return (
    <div className="min-h-screen bg-white"> 
      
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION - (Sudah memiliki 3 layer) */}
      <HeroSection />

      {/* 🟢 LANGUAGES SECTION - GRADIENT DIBALIK + 3 LAYERS */}
      <div 
        id="languages" 
        className="relative px-4 py-16 overflow-hidden sm:px-6 lg:px-8" // Tambahkan overflow-hidden
        style={{
            // LAYER 1: Gradien Utama (Dibalik)
            background: `linear-gradient(to top, #FFFFFF 0%, #A5D6A7 50%, #66BB6A 100%)`, 
        }}
      >
        
        {/* LAYER 2 & 3: Blob Blur (Disamakan dengan Hero) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* A. Blob Cahaya Biru/Putih Lebar */}
            <div 
              className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
              style={{
                  background: 'rgba(240, 248, 255, 0.4)', 
                  filter: 'blur(200px)',
                  opacity: 0.9,
                  transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                  zIndex: 1, // zIndex rendah
              }}
            />
          
            {/* B. Blob Cahaya Hijau/Emerald */}
            <div 
              className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
              style={{
                  background: 'rgba(0, 168, 107, 0.08)', 
                  filter: 'blur(100px)',
                  opacity: 0.9,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2, // zIndex sedikit lebih tinggi
              }}
            />
        </div>

        {/* Konten Languages (Pastikan z-index lebih tinggi dari blob) */}
        <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Choose Your Language</h2> 
              <p className="mt-4 text-gray-600">Start your coding journey with interactive lessons</p>
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
                  <div 
                    key={language.id} 
                    onClick={() => handleLanguageClick(language)}
                    className="transition-transform duration-200 transform cursor-pointer hover:scale-105"
                  >
                    <LanguageCard 
                      language={language} 
                      progress={progress}
                      isPublic={!user}
                    />
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

{/* 🔴 PERBAIKAN: LEADERBOARD SECTION - BACKGROUND FULL PAGE */}
      <div 
        // Hapus max-w-7xl dan mx-auto dari sini. Biarkan full width.
        className="relative pb-16 overflow-hidden" 
        style={{
            // LAYER 1: Gradien Utama (Seperti Hero)
            background: `linear-gradient(to top, #66BB6A 0%, #A5D6A7 50%, #FFFFFF 100%)`,
        }}
      >
        
        {/* LAYER 2 & 3: Blob Blur (Background Layers) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* A. Blob Cahaya Biru/Putih Lebar */}
            <div 
              className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
              style={{
                  background: 'rgba(240, 248, 255, 0.4)', 
                  filter: 'blur(200px)',
                  opacity: 0.9,
                  transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                  zIndex: 1,
              }}
            />
          
            {/* B. Blob Cahaya Hijau/Emerald */}
            <div 
              className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
              style={{
                  background: 'rgba(0, 168, 107, 0.08)', 
                  filter: 'blur(100px)',
                  opacity: 0.9,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
              }}
            />
        </div>
        
        {/* KONTEN UTAMA: Div baru untuk membatasi lebar konten dan mengatur padding horizontal */}
        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="p-6"> 
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900">Global Leaderboard 🏆</h2>
                  <p className="mt-2 text-gray-600">See who's dominating the charts!</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow"> 
                  <Leaderboard data={leaderboard} />
                </div>
            </div>
        </div>
      </div>

    {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        selectedLanguage={selectedLanguage}
      />
      
      {/* 💡 FOOTER BARU */}
      <Footer />
    </div>
  );
};

export default Dashboard;