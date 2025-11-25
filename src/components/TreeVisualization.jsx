import React, { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Leaf, Zap, Award, BarChart3, TrendingUp, Info } from 'lucide-react'; 

/* ======================================= */
/* 1. CUSTOM HOOKS 🛠️ */
/* ======================================= */

/**
 * Hook untuk menghitung dan mengatur 1vh agar responsif di mobile (Fix h-screen)
 */
function useVh() {
    useEffect(() => {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };
        setVH();
        window.addEventListener("resize", setVH);
        return () => window.removeEventListener("resize", setVH);
    }, []);
}


/* ======================================= */
/* 2. HELPER COMPONENTS 🖼️ */
/* ======================================= */

/**
 * Visualisasi Pohon/Orb (Fokus utama di tengah layar)
 */
const Image3DModelPlaceholder = ({ imageUrl, stageName }) => {
    const isImageAvailable = imageUrl && imageUrl !== '/images/undefined';
    
    return (
        <div 
            className="relative flex items-center justify-center w-full h-full p-8" 
            aria-label={`Visual of ${stageName} stage`}
        >
            {isImageAvailable ? (
                // Gambar yang tampil besar, bulat, dengan glow
                <motion.img 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    src={imageUrl} 
                    alt={`Visual of ${stageName} stage`} 
                    className="w-[70vh] h-[70vh] max-w-[500px] max-h-[500px] 
                             rounded-full shadow-2xl border-4 border-white/50 
                             animate-pulse-slow transition-transform duration-700 ease-out 
                             md:max-w-none md:max-h-none object-contain" // object-contain untuk menghindari cropping
                    style={{ 
                        aspectRatio: '1/1',
                        // Custom Glow Effect
                        boxShadow: '0 0 50px rgba(100, 255, 100, 0.4)' 
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            ) : (
                // Fallback Placeholder
                <div className="flex flex-col items-center justify-center p-12 text-4xl font-extrabold transition-all duration-500 border-4 border-dashed shadow-inner md:text-5xl text-white/80 rounded-2xl bg-black/10 backdrop-blur-sm">
                    <span className="mb-2">🌱</span>
                    <span className="text-lg text-white/70">Visual: {stageName}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Teks Sudut (Gaya Detail Ocmba)
 */
const CornerDetails = memo(function CornerDetails() {
    // Teks Vertikal Kiri
    const LeftSidebarText = () => (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute top-0 left-0 z-30 flex items-center h-full pointer-events-none md:left-10" 
        >
            <p 
                className="text-[10px] text-gray-700/80 tracking-[0.2em] uppercase font-light 
                           transform -rotate-90 origin-bottom-left whitespace-nowrap font-satoshi
                           translate-x-3 md:translate-x-0" 
                style={{ letterSpacing: '0.25em' }} 
            >
                ADAPTIVE • INTELLIGENT • PRECISE
            </p>
        </motion.div>
    );


});


/* ======================================= */
/* 3. MAIN COMPONENT: CleanTreeVisualization */
/* ======================================= */

const CleanTreeVisualization = ({ treeData, userStats }) => {
    useVh(); 
    const navigate = useNavigate(); // Dibiarkan jika ingin ditambahkan tombol CTA lagi

    if (!treeData || !userStats) {
        return (
             <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl min-h-[500px]">
                <div className="w-8 h-8 border-b-2 border-green-600 rounded-full animate-spin"></div>
                <p className="ml-3 text-gray-600">Loading Evolution Tree...</p>
            </div>
        );
    }
    
    const { current_stage, next_stage, progress_to_next, total_exp } = treeData;

    // FUNGSI UTILITY UNTUK GET IMAGE URL
    const getTreeImageUrl = (stage) => {
        if (!stage || !stage.stage) return null;
        
        const imageMap = {
            'seed': '/images/seed.jpg',
            'sprout': '/images/sprout.png', 
            'small_tree': '/images/small_tree.png',
            'big_tree': '/images/big_tree.png',
            'ancient_tree': '/images/ancient_tree.png'
        };
        return imageMap[stage.stage] || imageMap['ancient_tree'];
    };

    const currentImageUrl = getTreeImageUrl(current_stage);
    const requiredExp = next_stage ? next_stage.min_exp - total_exp : 0;
    
    const ACCENT_COLOR = 'text-emerald-600 dark:text-lime-400';
    const TEXT_COLOR = 'text-gray-900 dark:text-white';

    // Animasi framer-motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2, 
                delayChildren: 0.5 
            }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section
            id="tree-visualization"
            // Menggunakan var(--vh) fix untuk tinggi layar penuh
            className="relative w-full h-[calc(var(--vh,1vh)*100)] overflow-hidden overflow-x-hidden bg-[#FFFFFF] flex items-center justify-center font-sans" 
        >
            
            {/* --- BACKGROUND LAYER 1: GRADIENT --- */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to top, #66BB6A 0%, #A5D6A7 50%, #FFFFFF 100%)`, 
                }}
            />
            
            {/* --- BACKGROUND LAYER 2: BLUR BLOBS --- */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Blob Cahaya Biru/Putih Lebar */}
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
                {/* Blob Cahaya Hijau/Emerald */}
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

            {/* --- VISUAL TENGAH: POHON/ORB (Z-10) --- */}
            <div className="absolute inset-0 z-10 opacity-90">
                <Image3DModelPlaceholder 
                    imageUrl={currentImageUrl} 
                    stageName={current_stage?.name || 'Seed'}
                />
            </div>

            {/* --- KONTEN UTAMA (Kiri & Kanan, Z-40) --- */}
            <div className="relative z-40 flex items-center justify-between w-full h-full px-4 py-8 max-w-7xl md:py-0">
                
                {/* KONTEN KIRI: Detail Stage & Total EXP */}
                <motion.div 
                    className="z-40 w-full p-6 space-y-8 md:w-1/4 md:p-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="p-4 border border-gray-200 shadow-xl rounded-xl backdrop-blur-sm bg-white/60 dark:bg-black/40 dark:border-gray-700">
                        <span className={`block mb-1 text-sm font-bold tracking-widest uppercase ${ACCENT_COLOR}`}>
                            <Leaf className="inline w-4 h-4 mr-1"/> Current Stage
                        </span>
                        <h2 className={`mb-2 text-3xl font-extrabold ${TEXT_COLOR}`}>
                            {current_stage?.name || 'Seed'}
                        </h2>
                        <p className={`text-sm italic ${TEXT_COLOR}/70`}>
                            {current_stage?.description || 'Starting your coding journey. Time to grow.'}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="p-4 border border-gray-200 shadow-xl rounded-xl backdrop-blur-sm bg-white/60 dark:bg-black/40 dark:border-gray-700">
                        <span className={`block mb-1 text-sm font-bold tracking-widest uppercase ${ACCENT_COLOR}`}>
                            <Zap className="inline w-4 h-4 mr-1"/> Total EXP
                        </span>
                        <p className={`text-4xl font-extrabold ${TEXT_COLOR}`}>
                            {total_exp.toLocaleString()}
                        </p>
                    </motion.div>
                </motion.div>

                {/* KONTEN KANAN: Progress Bar & Rank */}
                <motion.div 
                    className="z-40 w-full p-6 space-y-8 text-right md:w-1/4 md:p-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* NEXT STAGE & PROGRESS BAR */}
                    {next_stage ? (
                        <motion.div variants={itemVariants} className="p-4 border border-gray-200 shadow-xl rounded-xl backdrop-blur-sm bg-white/60 dark:bg-black/40 dark:border-gray-700">
                            <span className={`flex items-center justify-end text-sm font-bold tracking-widest uppercase ${ACCENT_COLOR}`}>
                                <TrendingUp className="w-4 h-4 ml-1"/> Next Stage
                            </span>
                            <p className={`mt-1 text-3xl font-extrabold ${TEXT_COLOR}`}>{next_stage?.name}</p>
                            
                            <div className="w-full h-3 mt-3 bg-gray-300 rounded-full shadow-inner dark:bg-gray-700">
                                <div 
                                    className={`h-full transition-all duration-1000 bg-yellow-500 rounded-full`}
                                    style={{ width: `${progress_to_next || 0}%` }}
                                ></div>
                            </div>
                            <div className={`flex items-center justify-between mt-2 text-sm font-medium ${TEXT_COLOR}/70`}>
                                <span className={`${ACCENT_COLOR}`}>{(progress_to_next || 0).toFixed(1)}%</span>
                                <span className="font-extrabold text-red-500">
                                    {(requiredExp || 0).toLocaleString()} EXP
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants} className="p-4 border border-yellow-400 shadow-xl rounded-xl bg-yellow-50/70 dark:bg-yellow-900/40">
                             <div className={`flex items-center justify-end text-lg font-extrabold text-yellow-600 dark:text-yellow-300`}>
                                 <Award className="w-6 h-6 ml-2" /> Max Stage Reached!
                             </div>
                        </motion.div>
                    )}

                    {/* CURRENT RANK */}
                    <motion.div variants={itemVariants} className="p-4 border border-gray-200 shadow-xl rounded-xl backdrop-blur-sm bg-white/60 dark:bg-black/40 dark:border-gray-700">
                        <span className={`block mb-1 text-sm font-bold tracking-widest uppercase ${ACCENT_COLOR}`}>
                            <BarChart3 className="inline w-4 h-4 mr-1"/> Current Rank
                        </span>
                        <p className={`text-4xl font-extrabold ${TEXT_COLOR}`}>
                            #{userStats?.rank || 'N/A'} 
                        </p>
                    </motion.div>
                </motion.div>
            </div>
            
            {/* --- FOOTER DETAIL (Z-40) --- */}
            <div className="absolute z-40 flex justify-center p-4 space-x-10 transform -translate-x-1/2 border rounded-full shadow-xl bottom-8 left-1/2 bg-white/50 dark:bg-black/30 backdrop-blur-md border-white/50 dark:border-gray-700">
                <div className="text-center">
                    <Info className={`${ACCENT_COLOR} w-6 h-6 mx-auto`} />
                    <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Adaptive Lessons</p>
                </div>
                <div className="text-center">
                    <Leaf className={`${ACCENT_COLOR} w-6 h-6 mx-auto`} />
                    <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Smart Progress</p>
                </div>
                <div className="text-center">
                    <Award className={`${ACCENT_COLOR} w-6 h-6 mx-auto`} />
                    <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Build Your Future</p>
                </div>
            </div>

            {/* --- SUDUT DETAIL (Z-30/40) --- */}
            <CornerDetails /> 

        </section>
    );
};

export default CleanTreeVisualization;