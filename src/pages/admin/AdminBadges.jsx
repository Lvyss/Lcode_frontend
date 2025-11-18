// src/pages/admin/AdminBadges.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminBadges = () => {
  const [badges, setBadges] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  
  // ✅ FIX: FORM DATA STRUCTURE YANG BARU & SIMPLE
  const [formData, setFormData] = useState({
    name: '',
    icon: null, // ✅ FILE OBJECT, bukan string URL
    color: 'yellow',
    description: '',
    section_id: '',
    required_parts: 1,
    order_index: 0,
    is_active: true
  });

  // ✅ FIX: PREVIEW IMAGE STATE
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBadges();
    fetchSections();
  }, []);

// Di fetchBadges(), tambah:
const fetchBadges = async () => {
  try {
    const response = await adminAPI.badges.get();
    console.log('📦 RAW BADGES DATA:', response.data);
    
    // Check satu badge spesifik
    if (response.data.length > 0) {
      const firstBadge = response.data[0];
      console.log('🔍 FIRST BADGE:', firstBadge);
      console.log('📁 icon_path:', firstBadge.icon_path);
      console.log('🌐 icon_url:', firstBadge.icon_url); // Ini yang harusnya ada
    }
    
    setBadges(response.data);
  } catch (error) {
    console.error('Failed to fetch badges:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchSections = async () => {
    try {
      const response = await adminAPI.badges.getSections();
      setSections(response.data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  // ✅ FIX: HANDLE FILE UPLOAD
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, icon: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ FIX: HANDLE SUBMIT WITH FILE UPLOAD
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('color', formData.color);
    submitData.append('description', formData.description);
    submitData.append('section_id', formData.section_id);
    submitData.append('required_parts', formData.required_parts);
    submitData.append('order_index', formData.order_index);
    submitData.append('is_active', formData.is_active ? '1' : '0');
    
    if (formData.icon) {
      submitData.append('icon', formData.icon);
    }

    try {
      console.log('📤 Sending badge data with file...');
      
      if (editingBadge) {
        await adminAPI.badges.update(editingBadge.id, submitData);
      } else {
        await adminAPI.badges.create(submitData);
      }
      
      setShowModal(false);
      resetForm();
      fetchBadges();
      alert('✅ Badge saved successfully!');
    } catch (error) {
      console.error('❌ Failed to save badge:', error);
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // ✅ FIX: HANDLE EDIT - CONVERT BACKEND DATA
  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      icon: null, // Reset file input
      color: badge.color,
      description: badge.description,
      section_id: badge.section_id.toString(),
      required_parts: badge.required_parts,
      order_index: badge.order_index,
      is_active: badge.is_active
    });

    // Set image preview from existing badge
    if (badge.icon_path) {
      setImagePreview(badge.icon_url); // Use the accessor from model
    } else {
      setImagePreview(null);
    }

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this badge?')) {
      try {
        await adminAPI.badges.delete(id);
        fetchBadges();
        alert('✅ Badge deleted successfully!');
      } catch (error) {
        console.error('Failed to delete badge:', error);
        alert(`Delete failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

  const resetForm = () => {
    setEditingBadge(null);
    setFormData({
      name: '',
      icon: null,
      color: 'yellow',
      description: '',
      section_id: '',
      required_parts: 1,
      order_index: badges.length + 1,
      is_active: true
    });
    setImagePreview(null);
  };

  // ✅ FIX: HELPER UNTUK DISPLAY BADGE COLOR
  const getColorClasses = (color) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'green': return 'bg-green-100 text-green-800 border-green-300';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // ✅ FIX: GET SECTION NAME FOR DISPLAY
  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? `${section.name} (${section.language_name})` : 'Unknown Section';
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Badges</h1>
        <p className="text-gray-600">Create achievement badges for students</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Badges & Achievements
              <span className="ml-2 text-sm text-gray-500">({badges.length} badges)</span>
            </h2>
            <button 
              onClick={() => {
                setFormData({
                  ...formData,
                  order_index: badges.length + 1
                });
                setShowModal(true);
              }}
              className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Add Badge
            </button>
          </div>
        </div>

        <div className="p-6">
          {badges.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl text-gray-400">🏆</div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No badges yet</h3>
              <p className="text-gray-600">Create your first achievement badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`border-2 rounded-lg p-4 ${getColorClasses(badge.color)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full">
                        {badge.icon_url ? (
                          <img 
                            src={badge.icon_url} 
                            alt={badge.name}
                            className="object-contain w-8 h-8"
                          />
                        ) : (
                          <span className="text-lg">🏆</span>
                        )}
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          badge.color === 'yellow' ? 'bg-yellow-200' :
                          badge.color === 'blue' ? 'bg-blue-200' :
                          badge.color === 'green' ? 'bg-green-200' :
                          badge.color === 'purple' ? 'bg-purple-200' :
                          badge.color === 'red' ? 'bg-red-200' :
                          'bg-indigo-200'
                        }`}>
                          {badge.color}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(badge)}
                        className="px-2 py-1 text-sm bg-white bg-opacity-50 rounded hover:bg-opacity-70"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(badge.id)}
                        className="px-2 py-1 text-sm text-red-600 bg-white bg-opacity-50 rounded hover:bg-opacity-70"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="mb-1 text-lg font-bold">{badge.name}</h3>
                  <p className="mb-2 text-sm text-gray-700">{badge.description}</p>
                  
                  <div className="mt-3 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Section:</span>
                      <span className="font-medium">{getSectionName(badge.section_id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Parts:</span>
                      <span className="font-medium">{badge.required_parts}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Status:</span>
                      <span className={`font-medium ${badge.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {badge.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              {editingBadge ? 'Edit Badge' : 'Add New Badge'}
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
                    placeholder="Badge name"
                  />
                </div>

                {/* ✅ FIX: FILE UPLOAD FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Badge Icon {!editingBadge && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload badge icon image (JPEG, PNG, GIF - max 2MB)
                  </p>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="object-contain w-16 h-16 mt-1 border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe what this badge represents..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color *</label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="yellow">Yellow</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="red">Red</option>
                      <option value="indigo">Indigo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section *</label>
                    <select
                      value={formData.section_id}
                      onChange={(e) => setFormData({...formData, section_id: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Section</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.name} ({section.language_name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Required Parts *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.required_parts}
                      onChange={(e) => setFormData({...formData, required_parts: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Index</label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="block ml-2 text-sm text-gray-700">Active Badge</label>
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
                  {editingBadge ? 'Update Badge' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadges;