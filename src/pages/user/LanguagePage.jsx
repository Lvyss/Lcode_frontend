// src/pages/user/LanguagePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';
import SectionCard from '../../components/SectionCard';

const LanguagePage = () => {
  const { id } = useParams();
  const [language, setLanguage] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchLanguageData();
  }, [id]);

  const fetchLanguageData = async () => {
    const [langRes, sectionsRes] = await Promise.all([
      userAPI.languages.getById(id),
         userAPI.languages.getSections(id) // ✅ INI YANG BENAR!
    ]);
    
    setLanguage(langRes.data);
    setSections(sectionsRes.data);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{language?.name}</h1>
        <p className="text-gray-600">{language?.description}</p>
      </div>

      <div className="space-y-4">
        {sections.map(section => (
          <SectionCard 
            key={section.id} 
            section={section} 
            languageId={id}
          />
        ))}
      </div>
    </div>
  );
};
export default LanguagePage;