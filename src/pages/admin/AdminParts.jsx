// src/pages/admin/AdminParts.jsx - SIMPLE WORKING VERSION
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';

const AdminParts = () => {
// UPDATE SEMUA FUNGSI DI AdminParts.jsx

const [parts, setParts] = useState([]);
const [sections, setSections] = useState([]);
const [languages, setLanguages] = useState([]);
const [selectedLanguage, setSelectedLanguage] = useState('');
const [selectedSection, setSelectedSection] = useState('');
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [editingPart, setEditingPart] = useState(null);
const [formData, setFormData] = useState({
  title: '',
  description: '',
  section_id: '',
  order_index: 1,
  exp_reward: 10,
  is_active: true,
  content: '<p>Start writing your learning content here...</p>'
});

useEffect(() => {
  fetchLanguages();
}, []);

useEffect(() => {
  if (selectedLanguage) {
    fetchSections(selectedLanguage);
  }
}, [selectedLanguage]);

useEffect(() => {
  if (selectedSection) {
    fetchParts(selectedSection);
  }
}, [selectedSection]);

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

const fetchSections = async (languageId) => {
  try {
    const response = await adminAPI.sections.getByLanguage(languageId);
    setSections(response.data);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
  }
};

// ✅ FIX: FETCH PARTS DENGAN CONTENT
const fetchParts = async (sectionId) => {
  try {
    const response = await adminAPI.parts.getBySection(sectionId);
    
    // ✅ LOAD CONTENT UNTUK SETIAP PART
    const partsWithContent = await Promise.all(
      response.data.map(async (part) => {
        try {
          // Coba ambil content blocks
          const contentResponse = await adminAPI.contentBlocks.getByPart(part.id);
          const contentBlocks = contentResponse.data;
          
          // Convert content blocks ke HTML
          let contentHTML = '<p>Start writing your learning content here...</p>';
          if (contentBlocks.length > 0) {
            contentHTML = convertContentBlocksToHTML(contentBlocks);
          }
          
          return {
            ...part,
            content_blocks: contentBlocks,
            content: contentHTML
          };
        } catch (error) {
          console.log(`No content blocks for part ${part.id}:`, error);
          // Fallback ke content dari field part (jika ada)
          return {
            ...part,
            content_blocks: [],
            content: part.content || '<p>Start writing your learning content here...</p>'
          };
        }
      })
    );
    
    setParts(partsWithContent);
  } catch (error) {
    console.error('Failed to fetch parts:', error);
  }
};

// ✅ FUNCTION CONVERT CONTENT BLOCKS KE HTML
const convertContentBlocksToHTML = (contentBlocks) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return '<p>Start writing your learning content here...</p>';
  }
  
  // Ambil block pertama (kita simpan semua HTML di satu block)
  const firstBlock = contentBlocks[0];
  
  // Jika content berisi HTML, gunakan langsung
  if (firstBlock.content?.html) {
    return firstBlock.content.html;
  }
  
  // Fallback ke text_content
  return `<p>${firstBlock.text_content || 'No content'}</p>`;
};

// ✅ FIX: HANDLE SUBMIT - SIMPAN PART DAN CONTENT
// UPDATE handleSubmit - TAMBAH DETAILED ERROR LOGGING
const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('🔄 Submitting part data:', formData);
  
  try {
    // 1. SIMPAN DATA PART DULU (TANPA CONTENT)
    let partData = {
      section_id: formData.section_id,
      title: formData.title,
      description: formData.description,
      order_index: formData.order_index,
      exp_reward: formData.exp_reward,
      is_active: formData.is_active
    };

    console.log('📦 Part data to save:', partData);

    let partResponse;
    
    if (editingPart) {
      console.log(`✏️ Updating part ${editingPart.id}`);
      partResponse = await adminAPI.parts.update(editingPart.id, partData);
    } else {
      console.log('🆕 Creating new part');
      partResponse = await adminAPI.parts.create(partData);
    }

    console.log('✅ Part saved:', partResponse.data);
    const partId = partResponse.data.id;

    // 2. ✅ SIMPAN CONTENT KE CONTENT_BLOCKS
    if (formData.content && formData.content !== '<p></p>' && formData.content !== '<p>Start writing your learning content here...</p>') {
      console.log('💾 Saving content blocks for part:', partId);
      console.log('📝 Content to save:', formData.content);
      await saveContentBlocks(partId, formData.content, !!editingPart);
    } else {
      console.log('ℹ️ No content to save or empty content');
    }

    setShowModal(false);
    resetForm();
    
    // 3. RELOAD PARTS UNTUK DAPAT CONTENT TERBARU
    if (selectedSection) {
      console.log('🔄 Reloading parts for section:', selectedSection);
      await fetchParts(selectedSection);
    }
    
    alert('✅ Part saved successfully with content!');
  } catch (error) {
    console.error('❌ FAILED TO SAVE PART:', error);
    console.error('📋 Error response:', error.response);
    console.error('🔍 Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    alert(`Failed: ${error.response?.data?.message || error.message}`);
  }
};

// UPDATE saveContentBlocks di AdminParts.jsx - GUNAKAN TYPE YANG VALID
const saveContentBlocks = async (partId, htmlContent, isEditing = false) => {
  try {
    console.log(`💾 Starting content blocks save for part ${partId}, editing: ${isEditing}`);
    
    // Jika edit, hapus content blocks lama dulu
    if (isEditing) {
      try {
        console.log(`🗑️ Deleting old content blocks for part ${partId}`);
        const existingContent = await adminAPI.contentBlocks.getByPart(partId);
        console.log(`Found ${existingContent.data.length} existing content blocks`);
        
        for (let block of existingContent.data) {
          console.log(`Deleting content block ${block.id}`);
          await adminAPI.contentBlocks.delete(partId, block.id);
        }
        console.log('✅ Old content blocks deleted');
      } catch (error) {
        console.log('ℹ️ No existing content blocks to delete or error:', error.message);
      }
    }

    // ✅ GUNAKAN TYPE YANG SUDAH DIVALIDASI
    const contentBlockData = {
      type: 'paragraph', // ✅ GUNAKAN paragraph BUKAN html_content
      content: { 
        html: htmlContent,
        text: stripHTML(htmlContent).substring(0, 200) + '...'
      },
      text_content: stripHTML(htmlContent),
      order_index: 1,
      language: 'html',
      metadata: { 
        format: 'html',
        created_at: new Date().toISOString()
      }
    };

    console.log('📦 Content block data to save:', contentBlockData);
    
    // Simpan content block
    console.log(`🚀 Sending POST to /admin/parts/${partId}/content-blocks`);
    const response = await adminAPI.contentBlocks.create(partId, contentBlockData);
    console.log('✅ Content block saved successfully!', response.data);
    
  } catch (error) {
    console.error('❌ FAILED TO SAVE CONTENT BLOCK:', error);
    console.error('📋 Content block error response:', error.response);
    console.error('🔍 Content block error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // Jangan throw error, biar part tetap tersimpan
    console.log('⚠️ Continuing without content block save');
  }
};


// ✅ FUNCTION UNTUK HAPUS HTML TAGS
const stripHTML = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// ✅ FIX: RESET FORM
const resetForm = () => {
  setEditingPart(null);
  setFormData({
    title: '',
    description: '',
    section_id: selectedSection || '',
    order_index: parts.length + 1,
    exp_reward: 10,
    is_active: true,
    content: '<p>Start writing your learning content here...</p>'
  });
};

// ✅ FIX: HANDLE EDIT - LOAD CONTENT DENGAN BENAR
const handleEdit = (part) => {
  console.log('📝 Editing part:', part);
  
  setEditingPart(part);
  setFormData({
    title: part.title,
    description: part.description || '',
    section_id: part.section_id,
    order_index: part.order_index,
    exp_reward: part.exp_reward,
    is_active: part.is_active,
    content: part.content || '<p>Start writing your learning content here...</p>'
  });
  
  // Find language from section
  const section = sections.find(s => s.id === part.section_id);
  if (section) {
    setSelectedLanguage(section.language_id);
    setSelectedSection(part.section_id);
  }
  
  setShowModal(true);
};

// ✅ FIX: HANDLE DELETE - HAPUS CONTENT DULU
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this part? This will also delete all associated content.')) {
    try {
      // 1. HAPUS CONTENT BLOCKS DULU (jika ada)
      try {
        const contentResponse = await adminAPI.contentBlocks.getByPart(id);
        const contentBlocks = contentResponse.data;
        
        for (let block of contentBlocks) {
          await adminAPI.contentBlocks.delete(id, block.id);
        }
        console.log(`🗑️ Deleted ${contentBlocks.length} content blocks`);
      } catch (error) {
        console.log('No content blocks to delete or error:', error);
      }

      // 2. HAPUS PART
      await adminAPI.parts.delete(id);
      
      // 3. RELOAD DATA
      if (selectedSection) {
        await fetchParts(selectedSection);
      }
      
      alert('✅ Part deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete part:', error);
      const errorMsg = error.response?.data?.message || 'Unknown error';
      
      if (errorMsg.includes('existing content') || errorMsg.includes('existing exercises')) {
        alert(`Cannot delete part: ${errorMsg}\n\nPlease try again or contact support.`);
      } else {
        alert(`Delete failed: ${errorMsg}`);
      }
    }
  }
};

// ✅ FIX: TOGGLE ACTIVE
const toggleActive = async (part) => {
  try {
    await adminAPI.parts.update(part.id, {
      ...part,
      is_active: !part.is_active
    });
    if (selectedSection) {
      await fetchParts(selectedSection);
    }
  } catch (error) {
    console.error('Failed to toggle part status:', error);
    alert('Failed to update part status');
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Parts</h1>
        <p className="text-gray-600">Create learning parts with rich content</p>
      </div>

      {/* FILTER SECTION */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setSelectedSection('');
                setParts([]);
              }}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose language...</option>
              {languages.map(language => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedLanguage}
            >
              <option value="">Choose section...</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => {
                if (!selectedSection) {
                  alert('Please select a section first');
                  return;
                }
                setFormData({
                  ...formData,
                  section_id: selectedSection,
                  order_index: parts.length + 1
                });
                setShowModal(true);
              }}
              className="w-full px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedSection}
            >
              Add Part to Section
            </button>
          </div>
        </div>
      </div>

      {/* PARTS TABLE */}
      {selectedSection && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Parts in {sections.find(s => s.id == selectedSection)?.name}
                <span className="ml-2 text-sm text-gray-500">({parts.length} parts)</span>
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Part</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">EXP Reward</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.map((part) => (
                  <tr key={part.id} className={!part.is_active ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{part.title}</div>
                      <div className="max-w-xs text-sm text-gray-500 truncate">{part.description}</div>
                      {!part.is_active && (
                        <span className="text-xs text-gray-500">(Inactive)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{part.order_index}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{part.exp_reward} EXP</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(part)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          part.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {part.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <button 
                        onClick={() => handleEdit(part)}
                        className="mr-4 text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(part.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {parts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No parts found for this section. Create your first part!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              {editingPart ? 'Edit Part' : 'Add New Part'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Part 1: Variables and Data Types"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">EXP Reward *</label>
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

                  <div className="flex items-end">
                    <label className="flex items-center">
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
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of what students will learn..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Learning Content
                  </label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({...formData, content})}
                    placeholder="Write your learning content here..."
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
                  {editingPart ? 'Update Part' : 'Create Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParts;