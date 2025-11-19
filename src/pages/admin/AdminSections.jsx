// src/pages/admin/AdminSections.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminSections = () => {
  const [sections, setSections] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language_id: '',
    order_index: 1,
    exp_reward: 10,
    is_active: true
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  // ✅ FETCH LANGUAGES
  const fetchLanguages = async () => {
    try {
      const response = await adminAPI.languages.get();
      setLanguages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      setLoading(false);
    }
  };

  // ✅ FETCH SECTIONS BERDASARKAN LANGUAGE
  const fetchSections = async (languageId) => {
    if (!languageId) {
      setSections([]);
      return;
    }
    
    try {
      const response = await adminAPI.sections.getByLanguage(languageId);
      setSections(response.data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  // ✅ HANDLE LANGUAGE CHANGE
  const handleLanguageChange = (e) => {
    const languageId = e.target.value;
    setSelectedLanguage(languageId);
    fetchSections(languageId);
  };

  // ✅ HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Submitting section:', formData);
    
    try {
      if (editingSection) {
        await adminAPI.sections.update(editingSection.id, formData);
      } else {
        await adminAPI.sections.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchSections(selectedLanguage); // Refresh sections
    } catch (error) {
      console.error('❌ Failed to save section:', error);
      console.error('📋 Error details:', error.response?.data);
      alert(`Failed to save: ${error.response?.data?.message || 'Validation error'}`);
    }
  };

  // ✅ RESET FORM
  const resetForm = () => {
    setEditingSection(null);
    setFormData({
      name: '',
      description: '',
      language_id: selectedLanguage || '',
      order_index: sections.length + 1,
      exp_reward: 10,
      is_active: true
    });
  };

  // ✅ HANDLE EDIT
  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      description: section.description || '',
      language_id: section.language_id,
      order_index: section.order_index,
      exp_reward: section.exp_reward,
      is_active: section.is_active
    });
    setShowModal(true);
  };

  // ✅ HANDLE DELETE
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await adminAPI.sections.delete(id);
        fetchSections(selectedLanguage);
      } catch (error) {
        console.error('Failed to delete section:', error);
        alert(`Delete failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

  // ✅ TOGGLE ACTIVE STATUS
  const toggleActive = async (section) => {
    try {
      await adminAPI.sections.update(section.id, {
        ...section,
        is_active: !section.is_active
      });
      fetchSections(selectedLanguage);
    } catch (error) {
      console.error('Failed to toggle section status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Sections</h1>
        <p className="text-gray-600">Organize learning sections within languages</p>
      </div>

      {/* ✅ LANGUAGE SELECTOR */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700">
          Select Language to Manage Sections
        </label>
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="block w-full max-w-md px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Choose a language...</option>
          {languages.map(language => (
            <option key={language.id} value={language.id}>
              {language.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLanguage && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Sections for {languages.find(l => l.id == selectedLanguage)?.name}
              </h2>
              <button 
                onClick={() => {
                  setFormData({
                    ...formData,
                    language_id: selectedLanguage,
                    order_index: sections.length + 1
                  });
                  setShowModal(true);
                }}
                className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Add Section
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Section</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Badge Reward</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section.id} className={!section.is_active ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{section.name}</div>
                      {!section.is_active && (
                        <span className="text-xs text-gray-500">(Inactive)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{section.order_index}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{section.exp_reward} EXP</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(section)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          section.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {section.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm text-gray-900 truncate">{section.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <button 
                        onClick={() => handleEdit(section)}
                        className="mr-4 text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {sections.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No sections found for this language. Create your first section!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Hello World, Variables, Conditionals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Index *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.order_index}
                      onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Badge Reward *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.exp_reward}
                      onChange={(e) => setFormData({...formData, exp_reward: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe what students will learn in this section..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  {editingSection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSections;