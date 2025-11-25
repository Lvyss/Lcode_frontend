// src/components/SectionCard.jsx - IMPROVED VERSION

import React, { useState, useEffect } from 'react'; // ✅ TAMBAH useEffect
import { Link } from 'react-router-dom';
import PartDropdown from './PartDropdown'; 
import { userAPI } from '../services/api';
import { Lock, ChevronDown, CheckCircle, RefreshCw } from 'lucide-react'; // ✅ TAMBAH RefreshCw

const SectionCard = ({ 
    section, 
    languageId, 
    progress, 
    onProgressUpdate,
    index,
    isUnlocked
}) => {
    const [showParts, setShowParts] = useState(false);
    const [parts, setParts] = useState([]);
    const [loadingParts, setLoadingParts] = useState(false);
    const [refreshingProgress, setRefreshingProgress] = useState(false); // ✅ STATE REFRESH

    // ✅ DEFAULT PROGRESS DATA JIKA TIDAK ADA
    const progressData = progress || {
      section_id: section.id,
      total_parts: section.total_parts || 0,
      completed_parts: 0,
      progress_percentage: 0,
      section_completed: false
    };

    // ✅ AUTO-REFRESH PROGRESS KETIKA PARTS DIBUKA
    useEffect(() => {
        if (showParts && isUnlocked) {
            refreshProgress();
        }
    }, [showParts, isUnlocked]);

    // ✅ FUNGSI REFRESH PROGRESS
    const refreshProgress = async () => {
        if (!isUnlocked) return;
        
        setRefreshingProgress(true);
        try {
            await onProgressUpdate(); // Trigger parent untuk refresh progress
        } catch (error) {
            console.error('Failed to refresh progress:', error);
        } finally {
            setRefreshingProgress(false);
        }
    };

    const toggleParts = async () => {
        if (!isUnlocked) {
            alert(`Section ${index} terkunci. Selesaikan section sebelumnya terlebih dahulu.`);
            return; 
        }

        if (showParts) {
            setShowParts(false);
            return;
        }

        // ✅ REFRESH PROGRESS SEBELUM LOAD PARTS
        await refreshProgress();

        if (parts.length === 0) {
            setLoadingParts(true);
            try {
              const response = await userAPI.sections.getParts(section.id);
              setParts(response.data);
            } catch (error) {
              console.error('Failed to fetch parts:', error);
            } finally {
              setLoadingParts(false);
            }
        }
        setShowParts(true);
    };

    // ✅ HANDLE PART COMPLETION (dipanggil dari PartDropdown)
    const handlePartComplete = async () => {
        console.log(`🎯 Part completed in section ${section.id}, refreshing progress...`);
        await refreshProgress();
        
        // ✅ AUTO-REFRESH PARTS JIKA SEDANG DIBUKA
        if (showParts) {
            const response = await userAPI.sections.getParts(section.id);
            setParts(response.data);
        }
    };

    // Fungsi utilitas untuk progress bar
    const getProgressColor = (percentage) => {
      if (percentage === 0) return 'bg-gray-300';
      if (percentage < 100) return 'bg-indigo-500';
      return 'bg-emerald-500';
    };

    const getStatusText = () => {
        if (progressData.section_completed) {
            return { text: 'Mastered', color: 'text-emerald-800', bg: 'bg-emerald-100' };
        }
        if (progressData.progress_percentage > 0) {
            return { text: 'In Progress', color: 'text-indigo-800', bg: 'bg-indigo-100' };
        }
        return { text: 'Not Started', color: 'text-gray-800', bg: 'bg-gray-100' };
    };

    const status = getStatusText();

    return (
        <div className={`overflow-hidden rounded-xl transition-all duration-500
            ${isUnlocked 
                ? 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl' 
                : 'bg-gray-50 border border-gray-200 shadow-md opacity-80 cursor-not-allowed'
            }
        `}>
            {/* ✅ SECTION HEADER WITH PROGRESS */}
            <div 
                className={`p-6 md:p-8 transition-colors border-b-2 border-transparent 
                    ${isUnlocked ? 'cursor-pointer hover:bg-indigo-50/10' : ''}`}
                onClick={toggleParts}
            >
                <div className="flex items-start justify-between">
                    
                    {/* 1. SECTION NUMBER & TITLE */}
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center mb-2 space-x-3">
                            <div className={`text-4xl font-extrabold font-serif 
                                ${isUnlocked ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                {index}
                            </div>
                            <h3 className={`text-2xl font-bold truncate 
                                ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}
                            >
                                {section.name}
                            </h3>
                        </div>
                        
                    </div>

                    {/* 2. PROGRESS BAR & STATUS */}
                    <div className="flex items-center flex-shrink-0 ml-6">
                        {isUnlocked ? (
                            <div className="w-48 text-right">
                                {/* Status Badge dengan Refresh Button */}
                                <div className="flex items-center justify-end space-x-2">
                                    {refreshingProgress ? (
                                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent toggle
                                                refreshProgress();
                                            }}
                                            className="p-1 text-gray-400 rounded hover:text-indigo-600 hover:bg-indigo-50"
                                            title="Refresh progress"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                        </button>
                                    )}
                                    
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.color} ${status.bg}`}>
                                        {progressData.section_completed && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {status.text}
                                    </span>
                                </div>
                                
                                {/* Progress Info */}
                                <div className="flex items-center justify-between mt-1 text-sm">
                                    <span className="text-gray-600">
                                        {progressData.completed_parts}/{progressData.total_parts} parts
                                    </span>
                                    <span className="font-medium text-indigo-600">
                                        {progressData.progress_percentage}%
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="h-2 mt-2 bg-gray-200 rounded-full">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-700 ${getProgressColor(progressData.progress_percentage)}`}
                                        style={{ width: `${progressData.progress_percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg">
                                <Lock className="w-4 h-4 mr-1" /> Locked
                            </div>
                        )}

                        {/* Chevron/Toggle Icon */}
                        {isUnlocked && (
                            <ChevronDown className={`w-6 h-6 ml-4 text-gray-500 transition-transform duration-300 ${showParts ? 'rotate-180' : ''}`} />
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ PARTS DROPDOWN CONTAINER */}
            {showParts && isUnlocked && ( 
                <div className="p-4 pt-0 border-t border-gray-200">
                    {loadingParts ? (
                        <div className="p-6 text-center">
                            <div className="w-6 h-6 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                            <p className="mt-2 text-sm text-gray-500">Loading parts...</p>
                        </div>
                    ) : (
                        <PartDropdown 
                            parts={parts} 
                            sectionId={section.id}
                            languageId={languageId}
                            onPartComplete={handlePartComplete} // ✅ PASS HANDLER BARU
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default SectionCard;