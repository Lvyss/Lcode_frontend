// src/pages/user/PartLearningPage.jsx - FINAL DESIGNED VERSION (Exercise Tanpa Padding Horizontal)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';

// 💡 IMPORT KOMPONEN LAYOUT
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
// Import ikon
import { Zap, CheckCircle, BookOpen } from 'lucide-react'; 

// Import Komponen Konten & Logika
import ContentRenderer from '../../components/ContentRenderer';
import ExerciseComponent from '../../components/ExerciseComponent';
import BadgeModal from '../../components/BadgeModal';

const PartLearningPage = () => {
    const params = useParams();
    const partId = params.partId || params.id; 
    
    const [part, setPart] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBadges, setNewBadges] = useState([]);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [exerciseStatus, setExerciseStatus] = useState({});

    // ... (Logika State & Fetching Data tidak diubah) ...
    useEffect(() => {
        if (partId) {
            fetchPartData();
        } else {
            console.error('❌ partId is undefined!');
            setLoading(false);
        }
    }, [partId]);

    const fetchPartData = async () => {
        try {
            setLoading(true);
            const [partRes, exercisesRes] = await Promise.all([
                userAPI.parts.getWithContent(partId),
                userAPI.parts.getExercises(partId)
            ]);
            setPart(partRes.data);
            setExercises(exercisesRes.data);
            await fetchExerciseStatuses(exercisesRes.data);
        } catch (error) {
            console.error('Failed to fetch part data:', error);
            setPart(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchExerciseStatuses = async (exercisesList) => {
        const statusMap = {};
        for (const exercise of exercisesList) {
            try {
                const response = await userAPI.progress.getExerciseStatus(exercise.id);
                statusMap[exercise.id] = response.data;
            } catch (error) {
                console.error(`Failed to fetch status for exercise ${exercise.id}:`, error);
                statusMap[exercise.id] = { completed: false, is_correct: false };
            }
        }
        setExerciseStatus(statusMap);
    };

    const handleExerciseComplete = async (responseData) => {
        setExerciseStatus(prev => ({
            ...prev,
            [responseData.progress.exercise_id]: {
                completed: true,
                is_correct: responseData.is_correct,
                user_answer: responseData.progress.user_answer,
                completed_at: responseData.progress.completed_at
            }
        }));

        if (responseData.awarded_badges && responseData.awarded_badges.length > 0) {
            setNewBadges(responseData.awarded_badges);
            setIsBadgeModalOpen(true);
        }
    };

    const handleBadgeModalClose = () => {
        setIsBadgeModalOpen(false);
        setNewBadges([]);
    };

    const calculatePartProgress = () => {
        const completedExercises = Object.values(exerciseStatus).filter(
            status => status.completed && status.is_correct
        ).length;
        
        const totalExercises = exercises.length;
        const progressPercentage = totalExercises > 0 
            ? Math.round((completedExercises / totalExercises) * 100) 
            : 0;

        return {
            completed: completedExercises === totalExercises && totalExercises > 0,
            completedExercises,
            totalExercises,
            progressPercentage
        };
    };

    const partProgress = calculatePartProgress();
    
    // --- LOADING & ERROR STATES (Tidak diubah) ---
    if (loading || !part) {
        // ... (Loading/Error handling code) ...
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-50">
                    <div className="text-center">
                        {loading ? (
                            <>
                                <div className="w-12 h-12 mx-auto border-b-4 border-indigo-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-lg text-gray-600">Loading part content...</p>
                            </>
                        ) : (
                             <div className="p-8 text-center bg-white border border-red-200 shadow-lg rounded-xl">
                                <div className="text-2xl font-bold text-red-600">Part Not Found 😥</div>
                                <p className="mt-2 text-gray-600">The content you are looking for ({partId}) could not be loaded.</p>
                                <button 
                                    onClick={() => window.history.back()}
                                    className="px-6 py-2 mt-6 font-semibold text-white transition duration-150 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                >
                                    Go Back to Section
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
    
    // --- MAIN RENDER ---
    return (
        <div className="relative flex flex-col min-h-screen">
            <Navbar />

            {/* ✅ BACKGROUND EFFECT CONTAINER (Dipindahkan ke luar main) */}
            <div className="absolute inset-0 overflow-hidden -z-10"> 
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to bottom, #F9FAFB 0%, #E0F2F1 50%, #B2DFDB 100%)`, 
                    }}
                />
                
                {/* Blob Blur */}
                <div className="absolute inset-0 pointer-events-none">
                    <div 
                        className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
                        style={{
                            background: 'rgba(230, 245, 255, 0.5)', 
                            filter: 'blur(150px)', 
                            opacity: 0.7, 
                            transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                            zIndex: 10,
                        }}
                    />
                    <div 
                        className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
                        style={{
                            background: 'rgba(77, 182, 172, 0.15)', 
                            filter: 'blur(100px)',
                            opacity: 0.8,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 11,
                        }}
                    />
                </div>
            </div>
            {/* END BACKGROUND EFFECT */}
            
            <main className="flex-grow">
                
                {/* 1. PART HEADER (Desain Menyatu/Nempel) */}
                {/* ✅ Tambahkan pt-8 untuk jarak dari Navbar */}
                <div className="relative z-20 pt-24 pb-8 bg-white border-b border-gray-200 shadow-sm"> 
                              <div className="absolute inset-0 overflow-hidden -z-10"> 
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to top, #F9FAFB 0%, #E0F2F1 50%, #B2DFDB 100%)`, 
                    }}
                />
                
                {/* Blob Blur */}
                <div className="absolute inset-0 pointer-events-none">
                    <div 
                        className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
                        style={{
                            background: 'rgba(230, 245, 255, 0.5)', 
                            filter: 'blur(150px)', 
                            opacity: 0.7, 
                            transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                            zIndex: 10,
                        }}
                    />
                    <div 
                        className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
                        style={{
                            background: 'rgba(77, 182, 172, 0.15)', 
                            filter: 'blur(100px)',
                            opacity: 0.8,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 11,
                        }}
                    />
                </div>
            </div>
                    <div className="max-w-4xl px-4 mx-auto sm:px-6 md:px-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-4xl font-extrabold leading-tight text-gray-900">{part.title}</h1>
                                <p className="mt-2 text-lg text-gray-600">{part.description}</p>
                                
                                {/* PROGRESS BAR */}
                                <div className="max-w-lg mt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="flex items-center text-base font-semibold text-gray-700">
                                            <CheckCircle className="w-5 h-5 mr-2 text-emerald-500"/>
                                            Exercises: {partProgress.completedExercises}/{partProgress.totalExercises}
                                        </span>
                                        <span className="text-xl font-bold text-indigo-600">
                                            {partProgress.progressPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full h-4 bg-indigo-100 rounded-full">
                                        <div 
                                            className="h-4 transition-all duration-500 bg-indigo-500 rounded-full shadow-md"
                                            style={{ width: `${partProgress.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* EXP REWARD */}
                            {part.exp_reward > 0 && (
                                <div className="flex-shrink-0 p-4 ml-6 text-right border border-yellow-200 rounded-lg bg-yellow-50">
                                    <div className="flex items-center justify-end text-xl font-bold text-yellow-700">
                                        <Zap className="w-6 h-6 mr-1 text-yellow-600 fill-yellow-400"/>
                                        +{part.exp_reward} EXP
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">Completion Reward</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. KONTEN UTAMA - Wrapper Max Width Saja, TANPA PADDING Horizontal */}
                {/* ✅ Hapus px-4 sm:px-6 md:px-8 dari div ini */}
                <div className="relative z-20 max-w-4xl py-10 mx-auto"> 
                    
                    {/* --- KONTEN PEMBELAJARAN --- */}
                    {/* ✅ TAMBAHKAN PADDING HORIZONTAL KE SINI */}
                    <div className="mb-12 **px-4 sm:px-6 md:px-8**">
                        <div className="flex items-center pb-2 mb-4 border-b border-gray-200">
                             <BookOpen className="w-6 h-6 mr-2 text-indigo-600"/>
                             <h2 className="text-2xl font-bold text-gray-800">Learning Material</h2>
                        </div>
                        <div className="p-6 prose bg-white border border-gray-100 shadow-lg rounded-xl max-w-none">
                            <ContentRenderer contentBlocks={part.content_blocks} />
                        </div>
                    </div>
                    {/* --- END KONTEN PEMBELAJARAN --- */}

                    
                    {/* ✅ EXERCISES SECTION (Tidak Perlu Padding Horizontal Baru) */}
                    <div className="space-y-6">
                        {/* Title bar tetap di dalam container Exercises Section */}
                        <div className="flex items-center justify-between p-4 border-l-4 border-indigo-600 rounded-r-lg shadow-inner bg-indigo-50 **px-4 sm:px-6 md:px-8**">
                            <h2 className="text-2xl font-bold text-indigo-700">🧠 Practice Exercises</h2>
                            <div className="text-base text-gray-600">
                                {exercises.length} Exercises Total
                            </div>
                        </div>

                        {exercises.length === 0 ? (
                            <div className="py-8 text-center bg-white border rounded-lg **px-4 sm:px-6 md:px-8**">
                                <div className="text-gray-500">No exercises available for this part</div>
                            </div>
                        ) : (
                            exercises.map((exercise, index) => (
                                // Exercise Component sendiri akan full width dari wrapper max-w-4xl
                                <div className="**px-4 sm:px-6 md:px-8**" key={exercise.id}>
                                    <ExerciseComponent 
                                        exercise={exercise}
                                        exerciseStatus={exerciseStatus[exercise.id]}
                                        onComplete={handleExerciseComplete}
                                        index={index + 1}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* ✅ BADGE MODAL */}
            <BadgeModal 
                isOpen={isBadgeModalOpen}
                onClose={handleBadgeModalClose}
                badges={newBadges}
            />
            
            <Footer /> 

        </div>
    );
};

export default PartLearningPage;