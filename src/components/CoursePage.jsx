// src/pages/CoursePage.jsx 
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../services/api';
import SectionCard from '../components/SectionCard'; // Menggunakan SectionCard yang Anda miliki
// Asumsi Anda juga memiliki komponen untuk PartDropdown

const CoursePage = () => {
    const { languageId } = useParams();
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            // ✅ API call untuk mengambil semua data kursus, sections, dan progress
            const response = await userAPI.courses.getDetailWithSectionsAndProgress(languageId); 
            
            const courseData = response.data.course;
            // Urutkan sections berdasarkan index jika ada, atau biarkan urutan API
            const sectionsList = response.data.sections.sort((a, b) => a.index - b.index); 
            
            // Map progress ke objek agar mudah diakses
            const userProgressMap = response.data.progress.reduce((acc, p) => {
                acc[p.section_id] = p;
                return acc;
            }, {});

            setCourse(courseData);
            setSections(sectionsList);
            setProgress(userProgressMap);
        } catch (error) {
            console.error('Failed to fetch course data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Callback ini dipanggil oleh SectionCard setelah Part selesai, untuk me-refresh data induk
    const handleProgressUpdate = () => {
        // Cukup panggil ulang fungsi fetch data
        fetchCourseData(); 
    };

    useEffect(() => {
        fetchCourseData();
    }, [languageId]);

    if (loading) {
        return <div className="min-h-screen p-10 text-center text-white bg-gray-900">Loading course details...</div>;
    }
    if (!course) {
        return <div className="min-h-screen p-10 text-center text-white bg-gray-900">Course not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* 🖼️ HEADER KURSUS (Mirip Screenshot Anda) */}
            <div 
                className="relative pt-24 pb-20 overflow-hidden text-white" 
                style={{ 
                    backgroundImage: `url(${course.header_image_url || '/default-bg.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-70"></div> 
                
                <div className="relative z-10 max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-green-600 rounded-full">
                        {course.level || 'BEGINNER'}
                    </span>
                    <h1 className="text-6xl font-extrabold leading-tight text-white">
                        {course.name || 'C++ Fundamentals'}
                    </h1>
                    <p className="max-w-3xl mt-4 text-xl font-light">
                        {course.description || 'Master the basics of C++ programming, including data structures and object-oriented concepts.'}
                    </p>
                    <button className="px-8 py-3 mt-8 text-lg font-semibold text-gray-900 transition-colors bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-300">
                        Start Learning for Free
                    </button>
                </div>
            </div>
            
            {/* 📚 DAFTAR SECTION & SIDEBAR */}
            <div className="relative z-10 max-w-6xl px-4 py-10 mx-auto -mt-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-6">
                    
                    {/* ➡️ KOLOM UTAMA (Section List) */}
                    <div className="col-span-12 space-y-4 lg:col-span-8">
                        {/* ✅ LOOPING MERENDER SETIAP SectionCard */}
                        {sections.map((section, index) => (
                            <SectionCard
                                key={section.id}
                                // section kita tambahkan index untuk penomoran
                                section={{ ...section, index: index + 1 }} 
                                languageId={languageId}
                                progress={progress[section.id]} 
                                onProgressUpdate={handleProgressUpdate}
                            />
                        ))}
                    </div>
                    
                    {/* 📊 KOLOM SIDEBAR (Mirip Screenshot Anda) */}
                    <div className="self-start col-span-12 lg:col-span-4 lg:sticky lg:top-8">
                        <div className="p-6 space-y-6 text-white bg-gray-800 border border-gray-700 shadow-xl rounded-xl">
                            {/* User Profile */}
                            <div className="pb-4 border-b border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <span className="text-4xl">🧑‍💻</span>
                                    <div>
                                        <div className="text-sm text-gray-400">Your Name</div>
                                        <div className="text-xl font-semibold text-white">Level 1</div>
                                    </div>
                                </div>
                                <button className="w-full py-2 mt-4 text-sm font-medium text-white transition bg-blue-600 rounded hover:bg-blue-700">
                                    View Profile
                                </button>
                            </div>
                            
                            {/* Course Progress Detail */}
                            <h3 className="mb-3 text-lg font-semibold text-white">Course Progress</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-center justify-between text-sm">
                                    <span className="flex items-center"><span className="mr-2 text-yellow-400">📝</span> Exercises</span>
                                    <span>{sections.reduce((acc, s) => acc + (progress[s.id]?.completed_parts || 0), 0)}/{sections.reduce((acc, s) => acc + (progress[s.id]?.total_parts || 0), 0)}</span>
                                </li>
                                {/* ... Data progress lainnya ... */}
                            </ul>
                            
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CoursePage;