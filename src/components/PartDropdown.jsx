// src/components/PartDropdown.jsx - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { Play, CheckCircle, Lock } from 'lucide-react';

const PartDropdown = ({ parts, sectionId, languageId, onPartComplete }) => {
    const [partProgress, setPartProgress] = useState({});
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [unlockedParts, setUnlockedParts] = useState(new Set()); // ✅ STATE UNLOCK DYNAMIC

    // ✅ FETCH PROGRESS UNTUK SETIAP PART
    useEffect(() => {
        const fetchAllProgress = async () => {
            setLoadingProgress(true);
            const progressMap = {};
            
            for (const part of parts) {
                try {
                    const response = await userAPI.progress.getPartProgress(part.id);
                    progressMap[part.id] = response.data;
                } catch (error) {
                    progressMap[part.id] = { 
                        part_completed: false, 
                        progress_percentage: 0,
                        completed_exercises: 0,
                        total_exercises: 0
                    };
                }
            }
            
            setPartProgress(progressMap);
            calculateUnlockedParts(progressMap); // ✅ HITUNG UNLOCK SETELAH DAPAT PROGRESS
            setLoadingProgress(false);
        };
        
        fetchAllProgress();
    }, [parts]);

// ✅ FUNGSI UNTUK HITUNG PART YANG TERBUKA - DEBUG VERSION
const calculateUnlockedParts = (progressMap) => {
    const unlocked = new Set();
    
    console.log("=== DEBUG UNLOCK LOGIC ===");
    
    parts.forEach((part, index) => {
        const progress = progressMap[part.id] || { 
            part_completed: false,
            completed_exercises: 0,
            total_exercises: 0
        };
        
        console.log(`Part ${part.id} (${part.title}):`, {
            part_completed: progress.part_completed,
            completed_exercises: progress.completed_exercises,
            total_exercises: progress.total_exercises,
            progress_percentage: progress.progress_percentage
        });
        
        // Part pertama selalu unlocked
        if (index === 0) {
            unlocked.add(part.id);
            console.log(`✅ Part ${part.id} unlocked: FIRST PART`);
            return;
        }
        
        // Part selanjutnya unlocked jika part sebelumnya selesai
        const previousPart = parts[index - 1];
        const previousProgress = progressMap[previousPart.id] || { 
            part_completed: false 
        };
        
        console.log(`🔑 Checking unlock for Part ${part.id}: Previous Part ${previousPart.id} completed = ${previousProgress.part_completed}`);
        
        if (previousProgress.part_completed) {
            unlocked.add(part.id);
            console.log(`✅ Part ${part.id} unlocked: PREVIOUS PART COMPLETED`);
        } else {
            console.log(`❌ Part ${part.id} locked: PREVIOUS PART NOT COMPLETED`);
        }
    });
    
    console.log("Final unlocked parts:", Array.from(unlocked));
    setUnlockedParts(unlocked);
};

    // ✅ REFRESH PROGRESS SETELAH PART SELESAI (dipanggil dari parent)
    useEffect(() => {
        if (onPartComplete) {
            // Re-fetch progress ketika ada update dari parent
            const refreshProgress = async () => {
                const progressMap = {};
                
                for (const part of parts) {
                    try {
                        const response = await userAPI.progress.getPartProgress(part.id);
                        progressMap[part.id] = response.data;
                    } catch (error) {
                        progressMap[part.id] = { 
                            part_completed: false, 
                            progress_percentage: 0 
                        };
                    }
                }
                
                setPartProgress(progressMap);
                calculateUnlockedParts(progressMap); // ✅ UPDATE UNLOCK STATUS
            };
            
            refreshProgress();
        }
    }, [onPartComplete, parts]);

    const getButtonStatus = (isCompleted, percentage) => {
        if (isCompleted) {
            return { 
                text: 'Finished', // ✅ UBAH JADI "Finished" BUKAN "Review"
                style: 'bg-emerald-500 text-white hover:bg-emerald-600',
                icon: <CheckCircle className="w-4 h-4 ml-1" />
            };
        }
        if (percentage > 0) {
            return { 
                text: 'Resume', 
                style: 'bg-yellow-500 text-white hover:bg-yellow-600',
                icon: <Play className="w-4 h-4 ml-1" />
            };
        }
        return { 
            text: 'Start', 
            style: 'bg-indigo-600 text-white hover:bg-indigo-700',
            icon: <Play className="w-4 h-4 ml-1" />
        };
    };

    if (loadingProgress) {
        return (
            <div className="p-6 text-center">
                <div className="w-6 h-6 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500">Memuat progres part...</p>
            </div>
        );
    }

    return (
        <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="mb-4 text-sm text-gray-700">
                Pilih bagian di bawah ini untuk memulai atau melanjutkan pelajaran Anda.
            </p>
            
            <div className="space-y-3">
                {parts.map((part, index) => {
                    const progress = partProgress[part.id] || { 
                        part_completed: false, 
                        progress_percentage: 0,
                        completed_exercises: 0,
                        total_exercises: 0
                    };
                    
                    const isCompleted = progress.part_completed;
                    const percentage = progress.progress_percentage || 0;
                    
                    // ✅ GUNAKAN STATE UNLOCK DYNAMIC
                    const isUnlocked = unlockedParts.has(part.id);
                    
                    const buttonStatus = getButtonStatus(isCompleted, percentage);
                    
                    const partLink = `/languages/${languageId}/sections/${sectionId}/part/${part.id}`;

                    return (
                        <div 
                            key={part.id}
                            className={`flex items-center justify-between p-3 transition-colors border border-gray-200 rounded-lg shadow-sm 
                                ${isUnlocked 
                                    ? 'bg-white hover:shadow-md' 
                                    : 'bg-gray-100 opacity-70 cursor-not-allowed'
                                }
                            `}
                        >
                            
                            {/* Judul & Deskripsi */}
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className={`flex items-center font-semibold text-md ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                    <span className="w-6 mr-3 font-mono text-lg text-indigo-500">{index + 1}.</span> 
                                    <span className="truncate">{part.title}</span>
                                    {isCompleted && (
                                        <CheckCircle className="w-4 h-4 ml-2 text-emerald-500" />
                                    )}
                                </h4>
                                
                                {/* ✅ PROGRESS INFO */}
                                <div className="mt-1 text-xs text-gray-500 ml-9">
                                    {part.type === 'Exercise' && (
                                        <span>
                                            Exercise • {progress.completed_exercises || 0}/{progress.total_exercises || part.total_exercises || 1} questions
                                        </span>
                                    )}
                                    {part.type === 'Article' && (
                                        <span>Bonus Article</span>
                                    )}
                                    
                                    {/* ✅ PROGRESS BAR KECIL */}
                                    {progress.total_exercises > 0 && (
                                        <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
                                            <div 
                                                className="h-1 transition-all duration-300 bg-green-500 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tombol Aksi */}
                            {isUnlocked ? (
                                <Link
                                    to={partLink}
                                    className={`flex items-center justify-center w-24 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${buttonStatus.style}`}
                                >
                                    {buttonStatus.text}
                                    {buttonStatus.icon}
                                </Link>
                            ) : (
                                <div className="flex items-center justify-center w-24 py-2 text-sm font-semibold text-red-700 bg-red-200 rounded-lg cursor-not-allowed">
                                    <Lock className="w-4 h-4 mr-1" /> Lock
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* ✅ DEBUG INFO (bisa dihapus setelah testing) */}
            <div className="p-2 mt-4 text-xs border border-blue-200 rounded bg-blue-50">
                <div className="font-semibold text-blue-800">Debug Info:</div>
                {parts.map(part => (
                    <div key={part.id} className="flex justify-between">
                        <span>Part {part.id}:</span>
                        <span>
                            Unlocked: {unlockedParts.has(part.id) ? '✅' : '❌'} | 
                            Completed: {partProgress[part.id]?.part_completed ? '✅' : '❌'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartDropdown;