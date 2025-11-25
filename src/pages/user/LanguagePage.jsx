import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import SectionCard from '../../components/SectionCard';
import { Package, CheckCircle, Trophy, Zap, Lock } from 'lucide-react'; 

const LanguagePage = () => {
    const { id } = useParams();
    const [language, setLanguage] = useState(null);
    const [sections, setSections] = useState([]);
    const [sectionProgress, setSectionProgress] = useState({}); 
    const [languageProgress, setLanguageProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [languageBadges, setLanguageBadges] = useState([]);
    const [sectionBadges, setSectionBadges] = useState({});

    // --- LOGIKA DATA FETCH ---
    useEffect(() => {
        fetchLanguageData();
    }, [id]);

// ✅ ERROR HANDLING UNTUK BADGES FETCH
const fetchLanguageData = async () => {
    try {
        setLoading(true);
        setError(null);
        
        const promises = [
            userAPI.languages.getById(id),
            userAPI.languages.getSections(id),
            userAPI.progress.getLanguageProgress(id),
            userAPI.profile.getStats(),
        ];

        // ✅ BADGES FETCH DENGAN ERROR HANDLING
        const badgesPromise = userAPI.badges.getLanguageBadges(id)
            .catch(error => {
                console.warn('⚠️ Failed to fetch badges, using empty array:', error);
                return { data: [] }; // Return empty array instead of failing
            });

        const [
            langRes, 
            sectionsRes, 
            languageProgressRes,
            profileRes,
            badgesRes
        ] = await Promise.all([...promises, badgesPromise]);

        setLanguage(langRes.data);
        const sectionsData = sectionsRes.data.sort((a, b) => a.index - b.index); 
        setSections(sectionsData);
        setLanguageProgress(languageProgressRes.data);
        setUserStats(profileRes.data.stats);
        setLanguageBadges(badgesRes.data || []); // ✅ DEFAULT KE EMPTY ARRAY
        
        console.log('🎯 Language Badges Data:', badgesRes.data);
        
        await fetchAllSectionProgress(sectionsData);
        await fetchAllSectionBadges(sectionsData);
    } catch (err) {
        console.error('Failed to fetch language data:', err);
        setLanguage({ 
            name: 'Data Not Found', 
            description: 'Language data could not be loaded.', 
            total_projects: 0, 
            max_xp: 0 
        });
        setError('Failed to load data.');
    } finally {
        setLoading(false);
    }
};

    // ✅ FETCH BADGES UNTUK SETIAP SECTION
    const fetchAllSectionBadges = async (sectionsData) => {
        try {
            const badgePromises = sectionsData.map(section => 
                userAPI.badges.getSectionBadges(section.id)
                    .then(response => ({
                        sectionId: section.id,
                        badges: response.data
                    }))
                    .catch(error => ({
                        sectionId: section.id,
                        badges: []
                    }))
            );
            
            const badgeResults = await Promise.all(badgePromises);
            const badgeMap = {};
            badgeResults.forEach(result => {
                badgeMap[result.sectionId] = result.badges;
            });
            setSectionBadges(badgeMap);
        } catch (err) {
            console.error('Failed to fetch section badges:', err);
        }
    };

    const fetchAllSectionProgress = async (sectionsData) => {
        try {
            const progressPromises = sectionsData.map(section => 
                userAPI.progress.getSectionProgress(section.id)
                    .then(response => ({
                        sectionId: section.id,
                        progress: response.data
                    }))
                    .catch(error => ({
                        // Default progress jika gagal fetch
                        sectionId: section.id,
                        progress: { section_id: section.id, total_parts: 0, completed_parts: 0, progress_percentage: 0, section_completed: false }
                    }))
            );
            const progressResults = await Promise.all(progressPromises);
            const progressMap = {};
            progressResults.forEach(result => {
                progressMap[result.sectionId] = result.progress;
            });
            setSectionProgress(progressMap);
        } catch (err) {
            console.error('Failed to fetch section progress:', err);
        }
    };
// ✅ IMPROVE REFRESH SECTION PROGRESS
const refreshSectionProgress = async (sectionId) => {
    try {
        console.log(`🔄 Refreshing progress for section ${sectionId}`);
        const response = await userAPI.progress.getSectionProgress(sectionId);
        setSectionProgress(prev => ({
            ...prev,
            [sectionId]: response.data
        }));
        
        // ✅ REFRESH LANGUAGE PROGRESS JUGA
        try {
            const langProgressResponse = await userAPI.progress.getLanguageProgress(id);
            setLanguageProgress(langProgressResponse.data);
        } catch (langError) {
            console.warn('Failed to refresh language progress:', langError);
        }
        
        return response.data;
    } catch (error) {
        console.error(`Failed to refresh progress for section ${sectionId}:`, error);
        throw error;
    }
};
    
    // --- UTILITIES & CALCULATIONS ---
    
   // ✅ HELPER FUNCTION UNTUK BADGE COLORS (DARI ADMIN BADGES)
    const getBadgeColorClass = (color) => {
        switch (color) {
            case 'yellow': return 'bg-yellow-50 border-yellow-300';
            case 'blue': return 'bg-blue-50 border-blue-300';
            case 'green': return 'bg-green-50 border-green-300';
            case 'purple': return 'bg-purple-50 border-purple-300';
            case 'red': return 'bg-red-50 border-red-300';
            case 'indigo': return 'bg-indigo-50 border-indigo-300';
            default: return 'bg-gray-50 border-gray-300';
        }
    };
// Tambahkan function ini di LanguagePage component

// ✅ HELPER UNTUK GET BADGE IMAGE URL
const getBadgeImageUrl = (iconPath) => {
    if (!iconPath) return null;
    
    // Jika sudah full URL
    if (iconPath.startsWith('http')) {
        return iconPath;
    }
    
    // Jika path storage, convert ke full URL
    const API_BASE_URL = 'http://localhost:8000';
    return `${API_BASE_URL}/storage/${iconPath}`;
};
    // ✅ HELPER UNTUK GET SECTION NAME
    const getSectionName = (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        return section ? section.name : 'Unknown Section';
    };

    // Loading State
    if (loading || !userStats) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-800 bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto border-b-2 rounded-full border-emerald-600 animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading language data and global progress...</p>
                </div>
            </div>
        );
    }
    
    // Calculations
    const totalExercises = sections.reduce((sum, s) => sum + (s.total_parts || 0), 0);
    const completedExercises = sections.reduce((sum, s) => sum + (sectionProgress[s.id]?.completed_parts || 0), 0);
    const totalProjects = language.total_projects || 2; 
    const completedProjects = userStats?.completed_projects || 0;
    const xpEarned = userStats?.xp_earned || 0;
    const maxXP = language.max_xp || 685; 

    // --- RENDER UTAMA DENGAN SPLIT BACKGROUND ---
    return (
        <div className="relative flex flex-col min-h-screen text-gray-900">
            
            <Navbar /> 

            {/* 1. LAYER ATAS: HEADER (DENGAN GRADIENT) */}
            <header className="relative w-full overflow-hidden">
                
                {/* 1a. Background Gradien (Layer 1 & 2 dari kode Anda) */}
                <div className="absolute inset-0 overflow-hidden -z-10"> 
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, #FFFFFF 0%, #A5D6A7 50%, #66BB6A 100%)`, 
                        }}
                    />
                    
                    {/* Blob Blur */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Blob A (Putih/Biru) */}
                        <div 
                            className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
                            style={{
                                background: 'rgba(240, 248, 255, 0.4)', 
                                filter: 'blur(200px)',
                                opacity: 0.9,
                                transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                                zIndex: 10,
                            }}
                        />
                        {/* Blob B (Hijau/Emerald) */}
                        <div 
                            className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
                            style={{
                                background: 'rgba(0, 168, 107, 0.08)', 
                                filter: 'blur(100px)',
                                opacity: 0.9,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 11,
                            }}
                        />
                    </div>
                </div>

                {/* 1b. Konten Header (Text) */}
                <div className="relative pt-24 pb-32 text-gray-900">
                    <div className="relative z-10 max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">

                        
                        <h1 className="text-6xl font-extrabold leading-tight text-gray-900">
                            {language.name || 'Python'}
                        </h1>
                        <p className="max-w-3xl mt-4 text-xl font-light text-gray-700">
                            {language.description || 'Learn programming fundamentals...'}
                        </p>
                        <button className="px-8 py-3 mt-8 text-lg font-semibold text-white transition-colors rounded-lg shadow-lg bg-emerald-600 hover:bg-emerald-700">
                            Start Learning for Free
                        </button>
                    </div>
                </div>

            </header>
            
            {/* 2. LAYER BAWAH: KONTEN UTAMA (DENGAN BACKGROUND PUTIH SOLID) */}
            <main className="relative z-20 flex-grow w-full "> 
                                {/* 1a. Background Gradien (Layer 1 & 2 dari kode Anda) */}
                <div className="absolute inset-0 overflow-hidden -z-10"> 
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, #66BB6A 0%, #A5D6A7 50%, #FFFFFF 100%)`, 
                        }}
                    />
                    
                    {/* Blob Blur */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Blob A (Putih/Biru) */}
                        <div 
                            className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
                            style={{
                                background: 'rgba(240, 248, 255, 0.4)', 
                                filter: 'blur(200px)',
                                opacity: 0.9,
                                transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                                zIndex: 10,
                            }}
                        />
                        {/* Blob B (Hijau/Emerald) */}
                        <div 
                            className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
                            style={{
                                background: 'rgba(0, 168, 107, 0.08)', 
                                filter: 'blur(100px)',
                                opacity: 0.9,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 11,
                            }}
                        />
                    </div>
                </div>
                <div className="max-w-6xl px-4 py-10 mx-auto -mt-20 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-12 gap-8">
                        
{/* ➡️ KOLOM 1 (8 KOLOM - Daftar Sections) */}
<div className="col-span-12 space-y-4 lg:col-span-8">
    {sections.length === 0 ? (
        <div className="p-12 text-center bg-gray-100 border border-gray-200 shadow-xl rounded-xl">
            <div className="text-lg text-gray-500">No sections available yet</div>
        </div>
    ) : (
        sections.map((section, index) => {
            // ✅ POIN 5: IMPROVE UNLOCK LOGIC
            const isUnlocked = index === 0 || 
                (sectionProgress[sections[index - 1].id]?.section_completed === true);
            
            return (
                <SectionCard 
                    key={section.id} 
                    section={section} 
                    languageId={id}
                    progress={sectionProgress[section.id]} 
                    onProgressUpdate={() => refreshSectionProgress(section.id)} 
                    index={index + 1} 
                    isUnlocked={isUnlocked}
                />
            );
        })
    )}
</div>
                        
                        {/* 📊 KOLOM 2 (4 KOLOM - Sidebar) */}

 <div className="self-start col-span-12 space-y-8 lg:col-span-4 lg:sticky lg:top-8">
        
        
        {/* Course Progress - FULL DYNAMIC DENGAN LANGUAGE PROGRESS! */}
        <div className="p-6 bg-white border border-gray-200 shadow-xl rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Course Progress</h3>
            <div className="space-y-4 text-gray-700">
                
                {/* ✅ SECTION PROGRESS */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <span>Sections:</span>
                    </div>
                    <span className="font-bold">
                        {languageProgress ? `${languageProgress.completed_sections}/${languageProgress.total_sections}` : '0/0'}
                    </span>
                </div>
                
                {/* ✅ PART PROGRESS */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-indigo-600" />
                        <span>Parts:</span>
                    </div>
                    <span className="font-bold">
                        {languageProgress ? `${languageProgress.completed_parts}/${languageProgress.total_parts}` : '0/0'}
                    </span>
                </div>
                
                {/* ✅ EXERCISE PROGRESS */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Exercises:</span>
                    </div>
                    <span className="font-bold">
                        {languageProgress ? `${languageProgress.completed_exercises}/${languageProgress.total_exercises}` : '0/0'}
                    </span>
                </div>
                
                {/* ✅ OVERALL PROGRESS BAR */}
                <div className="pt-4">
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Overall Progress</span>
                        <span className="font-bold">
                            {languageProgress ? `${languageProgress.overall_progress}%` : '0%'}
                        </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full">
                        <div 
                            className="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" 
                            style={{ 
                                width: `${languageProgress ? languageProgress.overall_progress : 0}%` 
                            }}
                        ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Complete all sections to finish this language
                    </p>
                </div>
                
            </div>
        </div>
        
        {/* Quick Stats */}
        <div className="p-6 bg-white border border-gray-200 shadow-xl rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                        {languageProgress ? languageProgress.completed_sections : 0}
                    </div>
                    <div className="text-gray-500">Sections Done</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {languageProgress ? languageProgress.completed_parts : 0}
                    </div>
                    <div className="text-gray-500">Parts Done</div>
                </div>
            </div>
        </div>


{/* ✅ COURSE BADGES - GUNAKAN icon_path SEBAGAI GAMBAR URL! */}
<div className="p-6 bg-white border border-gray-200 shadow-xl rounded-xl">
    <h3 className="mb-4 text-lg font-bold text-gray-900">Course Badges</h3>
    <p className="mb-4 text-sm text-gray-500">
        Complete sections to earn badges! 
        <span className="block mt-1 text-xs">
            {languageBadges.filter(badge => badge.earned).length}/{languageBadges.length} earned
        </span>
    </p>
    
{/* ✅ BADGES GRID - GUNAKAN icon_path SEBAGAI GAMBAR */}
<div className="grid grid-cols-3 gap-3">
    {/* ✅ POIN 4: TAMBAH LOADING STATE */}
    {loading ? (
        <div className="col-span-3 py-8 text-center">
            <div className="w-8 h-8 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Loading badges...</p>
        </div>
    ) : languageBadges.length > 0 ? (
        languageBadges.map((badge) => (
            <div 
                key={badge.id}
                className={`relative text-center p-3 rounded-lg border-2 transition-all transform ${
                    badge.earned 
                        ? getBadgeColorClass(badge.color) + ' scale-105 shadow-md'
                        : 'bg-gray-100 border-gray-300 opacity-50 scale-95'
                }`}
                title={badge.earned ? badge.description : `Locked: ${badge.description}`}
            >
                {/* ✅ BADGE IMAGE - GUNAKAN icon_path SEBAGAI GAMBAR URL */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2">
                    {badge.icon_path ? (
                        <img 
                            src={`http://localhost:8000/storage/${badge.icon_path}`}
                            alt={badge.name}
                            className={`object-contain w-10 h-10 ${
                                !badge.earned ? 'grayscale opacity-60' : ''
                            }`}
                            onError={(e) => {
                                console.error('❌ Gambar gagal load:', badge.icon_path);
                                e.target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = `text-2xl ${!badge.earned ? 'text-gray-400' : 'text-yellow-500'}`;
                                fallback.textContent = '🏆';
                                e.target.parentNode.appendChild(fallback);
                            }}
                        />
                    ) : (
                        <div className={`text-2xl ${badge.earned ? 'text-yellow-500' : 'text-gray-400'}`}>
                            🏆
                        </div>
                    )}
                </div>
                
                {/* ✅ BADGE NAME */}
                <div className="text-xs font-medium truncate">
                    {badge.name}
                </div>
                
                {/* ✅ SECTION INFO */}
                <div className="mt-1 text-xs text-gray-500 truncate">
                    {getSectionName(badge.section_id)}
                </div>
                
                {/* ✅ EARNED INDICATOR */}
                {badge.earned && (
                    <div className="absolute -top-1 -right-1">
                        <div className="flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
                            <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                    </div>
                )}
            </div>
        ))
    ) : (
        <div className="col-span-3 py-4 text-center text-gray-500">
            No badges available for this language
        </div>
    )}
</div>
    
    {/* ✅ SECTION BADGES PREVIEW */}
    <div className="pt-4 mt-4 border-t border-gray-200">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Section Progress</h4>
        <div className="flex flex-wrap gap-1">
            {sections.map((section, index) => {
                const sectionBadgeList = sectionBadges[section.id] || [];
                const earnedBadges = sectionBadgeList.filter(badge => badge.earned);
                
                return (
                    <div 
                        key={section.id}
                        className={`text-lg p-1 rounded transition-all ${
                            sectionProgress[section.id]?.section_completed 
                                ? 'bg-green-100 border border-green-300' 
                                : 'bg-gray-100 border border-gray-300 opacity-40'
                        }`}
                        title={`${section.name}: ${earnedBadges.length}/${sectionBadgeList.length} badges`}
                    >
                        {sectionProgress[section.id]?.section_completed ? '⭐' : `${index + 1}️⃣`}
                    </div>
                );
            })}
        </div>
    </div>
</div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer /> 
        </div>
    );
};

export default LanguagePage;