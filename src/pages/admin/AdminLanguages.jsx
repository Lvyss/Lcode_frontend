// src/pages/admin/AdminLanguages.jsx - IMAGE UPLOAD ONLY
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminLanguages = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    order_index: 1,
    is_active: true
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await adminAPI.languages.get();
      setLanguages(response.data);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    } finally {
      setLoading(false);
    }
  };


// ✅ COMPRESS IMAGE SEBELUM KIRIM
const compressImage = (file, maxWidth = 64, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed base64
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// ✅ HANDLE IMAGE UPLOAD DENGAN COMPRESSION
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Validasi file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size should be less than 2MB');
    return;
  }

  setUploading(true);

  try {
    // Compress image dulu
    const compressedImage = await compressImage(file, 64, 0.7);
    
    setFormData({...formData, icon: compressedImage});
    setImagePreview(compressedImage);
    setUploading(false);
    
    console.log('📏 Original size:', file.size, 'bytes');
    console.log('📏 Compressed size:', compressedImage.length, 'characters');
    
  } catch (error) {
    console.error('Image processing failed:', error);
    alert('Failed to process image');
    setUploading(false);
  }
};

  // ✅ REMOVE IMAGE
  const handleRemoveImage = () => {
    setFormData({...formData, icon: ''});
    setImagePreview(null);
  };

  // ✅ HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Submitting form data:', formData);
    
    try {
      if (editingLanguage) {
        await adminAPI.languages.update(editingLanguage.id, formData);
      } else {
        await adminAPI.languages.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchLanguages();
    } catch (error) {
      console.error('❌ Failed to save language:', error);
      console.error('📋 Error response data:', error.response?.data);
      alert(`Failed to save: ${error.response?.data?.message || 'Validation error'}`);
    }
  };

  // ✅ RESET FORM
  const resetForm = () => {
    setEditingLanguage(null);
    setFormData({ 
      name: '', 
      icon: '', 
      description: '', 
      order_index: languages.length + 1, 
      is_active: true 
    });
    setImagePreview(null);
  };

  // ✅ HANDLE EDIT
  const handleEdit = (language) => {
    setEditingLanguage(language);
    setFormData({
      name: language.name,
      icon: language.icon || '',
      description: language.description,
      order_index: language.order_index,
      is_active: language.is_active
    });
    
    // Set image preview jika ada icon
    if (language.icon) {
      setImagePreview(language.icon);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this language?')) {
      try {
        await adminAPI.languages.delete(id);
        fetchLanguages();
      } catch (error) {
        console.error('Failed to delete language:', error);
      }
    }
  };

  const toggleActive = async (language) => {
    try {
      await adminAPI.languages.update(language.id, {
        ...language,
        is_active: !language.is_active
      });
      fetchLanguages();
    } catch (error) {
      console.error('Failed to toggle language status:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Languages</h1>
        <p className="text-gray-600">Add programming languages for students to learn</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Programming Languages</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Add Language
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Icon</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Language</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {languages.map((language) => (
                <tr key={language.id} className={!language.is_active ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 w-8 h-8">
                      {language.icon ? (
                        <img 
                          src={language.icon} 
                          alt={language.name}
                          className="object-cover w-8 h-8 rounded"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded">
                          <span className="text-xs text-gray-500">No Icon</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{language.name}</div>
                      {!language.is_active && (
                        <span className="text-xs text-gray-500">(Inactive)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{language.order_index}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(language)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        language.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {language.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs text-sm text-gray-900 truncate">{language.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(language)}
                      className="mr-4 text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(language.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              {editingLanguage ? 'Edit Language' : 'Add New Language'}
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
                    placeholder="e.g., Python, JavaScript, C++"
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
                </div>

                {/* ✅ IMAGE UPLOAD SECTION - SIMPLIFIED */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Language Icon *
                  </label>
                  
                  <div className="space-y-3">
                    {/* Image Upload Input */}
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        required={!editingLanguage} // Required hanya untuk create baru
                      />
                      
                      {uploading && (
                        <div className="w-5 h-5 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                      )}
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative inline-block">
                        <div className="p-2 border border-gray-300 rounded-lg">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="object-cover w-16 h-16 rounded"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Help Text */}
                    <p className="text-xs text-gray-500">
                      Recommended: Square image, 64x64 pixels, max 2MB
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe this programming language..."
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
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : (editingLanguage ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLanguages;