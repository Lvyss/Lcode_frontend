// src/components/LanguageCard.jsx - REVISI DESAIN ICONIC (GRADIENT EMERALD POP-OUT)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Clock } from 'lucide-react';

const LanguageCard = ({ language, progress, isPublic = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // ✅ FUNCTION: GET IMAGE URL 
  const getImageUrl = (iconPath) => {
    if (!iconPath) return null;
    
    // Jika sudah full URL
    if (iconPath.startsWith('http') || iconPath.startsWith('data:image/')) {
      return iconPath;
    }

    // Jika path dari Laravel storage
    const API_BASE_URL = 'http://localhost:8000'; // GANTI DENGAN PORT LARAVEL-MU
    const fullUrl = `${API_BASE_URL}/storage/${iconPath}`;
    
    return fullUrl;
  };

  // ✅ PROGRESS CALCULATION
  const getProgressPercentage = () => {
    if (isPublic) return 0;
    const totalExercises = language.total_exercises || 50;
    const completedExercises = progress?.completed_exercises || 0;
    return Math.min(Math.round((completedExercises / totalExercises) * 100), 100);
  };

  const progressPercent = getProgressPercentage();
  const isActive = language.is_active;

  // ✅ FIXED ICON RENDER - PROPER LOGIC
  const renderIcon = () => {
    // CASE 1: Ada icon path DAN belum error -> Tampilkan gambar
    if (language.icon && !imageError) {
      const imageUrl = getImageUrl(language.icon);
      
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Loading indicator */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Spinner berwarna putih di kontainer ikon */}
              <div className="w-6 h-6 border-4 border-white rounded-full border-t-emerald-200 animate-spin"></div>
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={`${language.name} icon`}
            // Ukuran ikon lebih besar dan center
            className={`w-12 h-12 object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </div>
      );
    }

    // CASE 2: Tidak ada icon ATAU error -> Tampilkan fallback emoji
    return <span className="text-4xl text-white">💻</span>;
  };

  // ✅ CARD CONTENT - Menggunakan Font Poppins, Emerald Theme, dan Shadow Kuat
  const cardContent = (
    <div className={`
      relative p-8 transition-all duration-500 rounded-3xl group h-full flex flex-col justify-between 
      ${isActive
        ? 'bg-white border-2 border-emerald-500/20 shadow-lg hover:shadow-emerald-300/50 hover:border-emerald-500'
        : 'bg-gray-50 border-2 border-gray-200 shadow-sm opacity-80 cursor-not-allowed'
      }
      ${isPublic && isActive ? 'cursor-pointer' : ''}
    `}>
      
      {/* 🌟 STATUS BADGE */}
      <span className={`
        absolute top-6 right-6 inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-full font-satoshi shadow-md
        ${isActive 
          ? 'bg-emerald-500 text-white' 
          : 'bg-yellow-500 text-yellow-900'
        }
      `}>
        {isActive ? <Zap className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
        {isActive ? 'Active' : 'Coming Soon'}
      </span>

      {/* ✅ HEADER WITH ICON & TITLE */}
      <div className="flex flex-col items-center mb-6 text-center">
        {/* ICON CONTAINER BARU: GRADIENT EMERALD DARI ATAS KE KIRI ATAS -> SESUAI TEMA PREMIUM */}
        <div className={`
          flex items-center justify-center w-24 h-24 mb-4 
          transition-all duration-500 rounded-full shadow-2xl overflow-hidden
          ${isActive 
            // Gradien dari Emerald 600 ke Putih (Putih di kanan bawah, mendekati warna card)
            ? 'bg-gradient-to-br from-emerald-600 to-white text-white transform group-hover:scale-110 group-hover:shadow-emerald-500/50' 
            : 'bg-gray-200 text-gray-600'
          }
        `}>
          {renderIcon()}
        </div>
        
        <h3 className={`
          text-3xl font-poppins font-extrabold transition-colors mt-2
          ${isActive ? 'text-gray-900 group-hover:text-emerald-700' : 'text-gray-500'}
        `}>
          {language.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 font-satoshi">
          {language.sections_count || 0} sections • {language.parts_count || 0} exercises
        </p>
      </div>

      {/* ✅ DESCRIPTION */}
      <p className="flex-grow mb-6 leading-relaxed text-center text-gray-600 line-clamp-3 font-satoshi">
        {language.description || `Master ${language.name} programming through interactive exercises and real-world projects designed for all skill levels.`}
      </p>

      {/* PROGRESS BAR / CTA SECTION */}
      <div>
        {!isPublic && isActive ? (
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-sm font-satoshi">
              <span className="font-semibold text-gray-700">Completion</span>
              <span className="text-lg font-extrabold text-emerald-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 overflow-hidden rounded-full shadow-inner bg-emerald-100">
              <div
                className="h-full transition-all duration-500 rounded-full shadow-md bg-emerald-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-right text-gray-500">
              **{progress?.completed_exercises || 0}** of **{language.total_exercises || 50}** exercises
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              type="button"
              disabled={!isActive}
              className={`
                w-full flex items-center justify-center px-8 py-3.5 text-base font-bold rounded-xl transition-all duration-300 shadow-lg font-poppins
                ${isActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
                }
              `}
            >
              {isActive ? 'Start Learning' : 'Unavailable'}
              {isActive && <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ✅ RETURN LINK ATAU DIV
  const targetLink = `/language/${language.id}`;
  
  if (!isActive) {
    return <div>{cardContent}</div>;
  }

  return (
    <Link to={targetLink}>
      {cardContent}
    </Link>
  );
};

export default LanguageCard;