// src/pages/user/LanguagePage.jsx - UPDATED & ENHANCED
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';
import SectionCard from '../../components/SectionCard';

const LanguagePage = () => {
  const { id } = useParams();
  const [language, setLanguage] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionProgress, setSectionProgress] = useState({}); // ✅ NEW: Store section progress
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLanguageData();
  }, [id]);

  const fetchLanguageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [langRes, sectionsRes] = await Promise.all([
        userAPI.languages.getById(id),
        userAPI.languages.getSections(id)
      ]);
      
      setLanguage(langRes.data);
      const sectionsData = sectionsRes.data;
      setSections(sectionsData);

      // ✅ FETCH PROGRESS FOR EACH SECTION
      await fetchAllSectionProgress(sectionsData);
      
    } catch (err) {
      console.error('Failed to fetch language data:', err);
      setError('Failed to load language data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: FETCH SECTION PROGRESS
  const fetchAllSectionProgress = async (sectionsData) => {
    try {
      const progressPromises = sectionsData.map(section => 
        userAPI.progress.getSectionProgress(section.id)
          .then(response => ({
            sectionId: section.id,
            progress: response.data
          }))
          .catch(error => {
            console.error(`Failed to fetch progress for section ${section.id}:`, error);
            return {
              sectionId: section.id,
              progress: {
                section_id: section.id,
                total_parts: 0,
                completed_parts: 0,
                progress_percentage: 0,
                section_completed: false
              }
            };
          })
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

  // ✅ REFRESH PROGRESS FUNCTION
  const refreshSectionProgress = async (sectionId) => {
    try {
      const response = await userAPI.progress.getSectionProgress(sectionId);
      setSectionProgress(prev => ({
        ...prev,
        [sectionId]: response.data
      }));
    } catch (error) {
      console.error(`Failed to refresh progress for section ${sectionId}:`, error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading language data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-600">❌ {error}</div>
          <button 
            onClick={fetchLanguageData}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-gray-600">Language not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* ✅ LANGUAGE HEADER WITH STATS */}
      <div className="p-6 mb-8 bg-white border shadow-sm rounded-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{language.name}</h1>
            <p className="mt-2 text-gray-600">{language.description}</p>
            
            {/* ✅ LANGUAGE STATS */}
            <div className="flex items-center mt-4 space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {sections.length}
                </div>
                <div className="text-sm text-gray-500">Sections</div>
              </div>
              
              {/* ✅ CALCULATE OVERALL PROGRESS */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(sectionProgress).filter(progress => 
                    progress.section_completed
                  ).length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
          
          {/* ✅ LANGUAGE ICON/IMAGE */}
          {language.icon_url && (
            <div className="ml-6">
              <img 
                src={language.icon_url} 
                alt={language.name}
                className="object-cover w-16 h-16 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* ✅ SECTIONS LIST */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="py-12 text-center bg-white border rounded-xl">
            <div className="text-lg text-gray-500">No sections available yet</div>
            <div className="mt-2 text-sm text-gray-400">
              Check back later for new content!
            </div>
          </div>
        ) : (
          sections.map(section => (
            <SectionCard 
              key={section.id} 
              section={section} 
              languageId={id}
              progress={sectionProgress[section.id]} // ✅ PASS PROGRESS DATA
              onProgressUpdate={() => refreshSectionProgress(section.id)} // ✅ REFRESH FUNCTION
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LanguagePage;