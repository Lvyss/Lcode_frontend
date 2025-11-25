// src/components/Navbar.jsx - IMPLEMENTASI LOGIN MODAL
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import LoginModal from './LoginModal'; // <<< IMPORT MODAL

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [scrolled, setScrolled] = useState(false);
  // 1. STATE UNTUK MENGONTROL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false); 


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // Logika Animasi Title (Tidak Berubah)
  const logoText = "LCode";
  const letters = Array.from(logoText);

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: -20,
      filter: 'blur(4px)',
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 200,
        delay: 0.03 * i, 
      },
    }),
  };


  // Tentukan kelas CSS secara kondisional
  const navbarClasses = `
    fixed top-0 z-50 w-full transition-all duration-300
    ${scrolled ? 'bg-white shadow-sm border-b border-gray-200' : 'bg-transparent'}
  `;

  // Kelas untuk link navigasi (menggunakan font-poppins)
  const linkClasses = `
    font-poppins text-sm font-medium transition-colors duration-300
    ${scrolled ? 'text-gray-700 hover:text-emerald-600' : 'text-gray-900/90 hover:text-emerald-600'}
  `;


  return (
    <>
      <nav className={navbarClasses}>
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Gambar & Brand LCODE DENGAN ANIMASI (Tidak Berubah) */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              {/* Logo Gambar */}
              <img 
                src="/images/lcode-logo.png" 
                alt="LCode Logo" 
                className="w-7 h-7 md:w-10 md:h-10 animate-spin-slow" 
              />

              {/* Brand Teks dengan Animasi */}
              <motion.div
                className="text-blue-950/90 flex space-x-[0.5px] font-antiqua text-[18px] md:text-2xl tracking-normal"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {letters.map((letter, index) => (
                  <motion.span
                    key={index}
                    custom={index} 
                    variants={child}
                    initial="hidden"
                    animate="visible"
                    className="relative transition-transform duration-100 cursor-pointer hover:scale-125"
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </motion.div>
          </div>

          {/* Navigation Links (Tidak Berubah) */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#languages" className={linkClasses}>
                Languages
              </a>
              <a href="#leaderboard" className={linkClasses}>
                Leaderboard
              </a>
            </div>
          </div>

          {/* Login Button / User Info */}
          <div>
            {!user ? (
              <button
                // 2. GANTI ACTION MENJADI BUKA MODAL
                onClick={() => setIsModalOpen(true)} 
                className="px-4 py-2 text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors duration-300 font-poppins" 
              >
                Login
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className={`font-satoshi ${scrolled ? 'text-gray-700' : 'text-gray-900/80'}`}>Hi, {user.name}</span>
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600">👤</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </nav>
      
      {/* 3. RENDER LOGIN MODAL DI SINI */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // Logika: Setelah login berhasil, modal akan ditutup secara otomatis
        onLoginSuccess={() => { /* Opsional: Tambahkan logika redirect/refresh jika perlu */ }}
        // Di navbar, kita tidak tahu bahasa apa yang dipilih, jadi kirim null/undefined
        selectedLanguage={null} 
      />
    </>
  );
};

export default Navbar;