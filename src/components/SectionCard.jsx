// src/components/SectionCard.jsx
import React, { useState } from 'react';
import { userAPI } from '../services/api';
import PartDropdown from './PartDropdown';

const SectionCard = ({ section, languageId }) => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchParts = async () => {
    if (parts.length > 0) return;
    
    setLoading(true);
    try {
      const response = await userAPI.sections.getParts(section.id); // ✅ INI YANG BENAR!
      setParts(response.data);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    if (!expanded) {
      fetchParts();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <div>
          <h3 className="text-xl font-semibold">{section.name}</h3>
          <p className="text-gray-600">{section.description}</p>
        </div>
        <div className="text-2xl">
          {expanded ? '−' : '+'}
        </div>
      </div>

      {expanded && (
        <div className="mt-4">
          {loading ? (
            <div className="text-center">Loading parts...</div>
          ) : (
            <PartDropdown 
              parts={parts} 
              sectionId={section.id}
              languageId={languageId}
            />
          )}
        </div>
      )}
    </div>
  );
};
export default SectionCard;