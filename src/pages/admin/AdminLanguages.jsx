// src/pages/admin/AdminLanguages.jsx - KODE LENGKAP DENGAN PERBAIKAN EDIT/ICON
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminLanguages = () => {
    const [languages, setLanguages] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [showModal, setShowModal] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: null, // Berisi file object jika baru di-upload
        description: '',
        order_index: 1,
        is_active: true
    });
    // ✅ NEW STATE: Menyimpan path ikon lama dari database
    const [originalIcon, setOriginalIcon] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            setError(null);
            const response = await adminAPI.languages.get();
            
            if (response.data && Array.isArray(response.data)) {
                setLanguages(response.data);
            } else {
                console.warn('⚠️ Expected array but got:', response.data);
                setLanguages([]); 
            }
        } catch (error) {
            console.error('❌ Failed to fetch languages:', error);
            setError('Failed to load languages');
            setLanguages([]); 
        } finally {
            setLoading(false);
        }
    };

    // ✅ FUNGSI GET URL GAMBAR (Ganti dengan base URL Laravel yang benar!)
    // GANTI PORT 8000 INI DENGAN PORT LARAVEL BACKEND ANDA!
    const API_BASE_URL = 'http://localhost:8000'; 

    const getImageUrl = (iconPath) => {
        if (!iconPath) return null;
        
        // 1. Cek jika sudah berupa Full URL atau Base64
        if (iconPath.startsWith('http') || iconPath.startsWith('data:image/')) {
            return iconPath;
        }

        // 2. Jika hanya Storage Path (Kasus Laravel Storage)
        const fullUrl = `${API_BASE_URL}/storage/${iconPath}`;

        console.log(`🖼️ getImageUrl called. Path: "${iconPath}" => Full URL: "${fullUrl}"`);

        return fullUrl;
    };

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log('📁 File selected:', file.name, file.size, file.type);

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('Image size should be less than 2MB');
    return;
  }

  setFormData({...formData, icon: file});
  const previewUrl = URL.createObjectURL(file);
  setImagePreview(previewUrl);
  
  console.log('🖼️ New preview set, formData.icon:', file);
};

const handleRemoveImage = () => {
  console.log('🗑️ Removing image - Original:', originalIcon, 'Preview:', imagePreview);
  
  setFormData({...formData, icon: null});
  setImagePreview(null);
  
  // Reset file input
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.value = '';
  
  // Note: originalIcon tetap ada sampai submit
};
    // ✅ RESET FORM
    const resetForm = () => {
        setEditingLanguage(null);
        setOriginalIcon(null); // Reset original icon state
        setFormData({ 
            name: '', 
            icon: null, 
            description: '', 
            order_index: (languages?.length || 0) + 1, 
            is_active: true 
        });
        setImagePreview(null);
        // Reset file input DOM element
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    // ✅ HANDLE EDIT (Load data ke form)
    const handleEdit = (language) => {
        setEditingLanguage(language);
        // Simpan path ikon yang ada ke state originalIcon
        setOriginalIcon(language.icon || null); 
        
        setFormData({
            name: language.name,
            icon: null, // Reset file input baru
            description: language.description,
            order_index: language.order_index,
            is_active: language.is_active
        });
        
        // Set image preview dari existing icon 
        if (language.icon) {
            const imageUrl = getImageUrl(language.icon);
            setImagePreview(imageUrl);
        } else {
            setImagePreview(null);
        }
        
        setShowModal(true);
    };
const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);
  
  try {
    const submitData = new FormData();
    
    // ✅ DEBUG: Log state sebelum submit
    console.log('🔄 BEFORE SUBMIT - State:', {
      editingLanguage,
      formData,
      originalIcon,
      imagePreview
    });

    // ✅ Tambahkan SEMUA field ke FormData
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('order_index', formData.order_index.toString());
    submitData.append('is_active', formData.is_active ? '1' : '0');
    
    if (editingLanguage) {
      submitData.append('_method', 'PUT');
      
      // ✅ LOGIC ICON YANG LEBIH SIMPLE
      if (formData.icon) {
        // Ada file baru - upload
        submitData.append('icon', formData.icon);
        console.log('✅ Sending NEW icon');
      } else if (originalIcon && !imagePreview) {
        // Ada icon lama tapi preview kosong = HAPUS
        submitData.append('icon_action', 'REMOVE');
        console.log('🗑️ Requesting icon removal');
      } else {
        // Default: keep icon yang ada
        submitData.append('icon_action', 'KEEP');
        console.log('💾 Keeping existing icon');
      }

      // ✅ DEBUG: Check FormData contents
      console.log('📤 FormData Contents:');
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      await adminAPI.languages.update(editingLanguage.id, submitData);

    } else {
      // CREATE
      if (formData.icon) {
        submitData.append('icon', formData.icon);
      }
      await adminAPI.languages.create(submitData);
    }
    
    setShowModal(false);
    resetForm();
    fetchLanguages();
    console.log('✅ Update successful');
    
  } catch (error) {
    console.error('❌ FAILED TO UPDATE:', error);
    console.error('Error response:', error.response);
    
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat();
      alert(`Validation failed: ${errorMessages.join(', ')}`);
    } else {
      alert(`Failed to save: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  } finally {
    setUploading(false);
  }
};
    // ... (fungsi handleDelete dan toggleActive tetap sama)

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this language?')) {
            try {
                await adminAPI.languages.delete(id);
                fetchLanguages();
            } catch (error) {
                console.error('Failed to delete language:', error.response || error);
                alert('Failed to delete language');
            }
        }
    };

const toggleActive = async (language) => {
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', language.name);
    formData.append('description', language.description);
    formData.append('order_index', language.order_index.toString());
    formData.append('is_active', (!language.is_active).toString()); // ✅ Toggle value
    formData.append('icon_action', 'KEEP'); // ✅ Pertahankan ikon
    // Debug: lihat data yang akan dikirim
console.log('📤 Submitting data:');
for (let [key, value] of submitData.entries()) {
  console.log(`${key}:`, value);
}
    await adminAPI.languages.update(language.id, formData);
    fetchLanguages();
  } catch (error) {
    console.error('Failed to toggle language status:', error);
    alert('Failed to update language status');
  }
};

    // ----------------------------------------------------------------------
    // RENDER LOGIC
    // ----------------------------------------------------------------------

    if (loading) {
        // ... (loading state)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        // ... (error state)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="mb-4 text-6xl">😵</div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Failed to Load Languages</h3>
                    <p className="mb-4 text-gray-600">{error}</p>
                    <button 
                        onClick={fetchLanguages}
                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
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
                            onClick={() => {
                                resetForm(); 
                                setShowModal(true);
                            }}
                            className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Add Language
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* ... (table display logic) */}
                    {!languages || languages.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-6xl">💻</div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No languages yet</h3>
                            <p className="text-gray-600">Get started by adding your first programming language</p>
                        </div>
                    ) : (
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
                                {languages.map((language) => {
                                    const iconSrc = getImageUrl(language.icon);

                                    return (
                                    <tr key={language.id} className={!language.is_active ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-8 h-8">
                                                {language.icon ? (
                                                    <img 
                                                        src={iconSrc} 
                                                        alt={language.name}
                                                        className="object-cover w-8 h-8 rounded"
                                                        onError={(e) => {
                                                            console.error('❌ Gambar gagal dimuat untuk:', language.name, e.target.src);
                                                            e.target.style.display = 'none'; 
                                                        }}
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
                                            <div className="max-w-xs text-sm text-gray-900 truncate">
                                                {language.description || 'No description'}
                                            </div>
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
                                )})}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                            {editingLanguage ? 'Edit Language' : 'Add New Language'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="space-y-4">
                                {/* ... (Input Name, Order Index, Status - sama seperti sebelumnya) ... */}
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
                                
                                {/* Image Upload Section */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Language Icon {!editingLanguage && '*'}
                                    </label>
                                    
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />

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
                                        
                                        {/* Tampilkan ikon yang ada saat edit jika belum ada preview baru */}
                                        {editingLanguage && originalIcon && !formData.icon && !imagePreview && (
                                            <div className="p-2 border border-gray-300 rounded-lg">
                                                <p className="mb-2 text-xs text-gray-500">Current Icon:</p>
                                                <img 
                                                    src={getImageUrl(originalIcon)} // Menggunakan originalIcon
                                                    alt="Current" 
                                                    className="object-cover w-16 h-16 rounded"
                                                    onError={(e) => {
                                                        console.error('❌ Gambar lama gagal dimuat di modal:', e.target.src);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}

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