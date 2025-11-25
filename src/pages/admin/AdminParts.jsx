// src/pages/admin/AdminParts.jsx - VERSI TERBARU
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';

const AdminParts = () => {
  // ... STATE declarations remain the same
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
      // Update form data with new section_id and order_index when section changes
      setFormData(prev => ({
        ...prev,
        section_id: selectedSection,
        order_index: parts.length + 1 // Will be slightly inaccurate but good initial guess
      }));
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
              content: contentHTML // Gunakan contentHTML dari content blocks
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
      
      setParts(partsWithContent.sort((a, b) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    }
  };

  // ✅ FUNCTION CONVERT CONTENT BLOCKS KE HTML
  const convertContentBlocksToHTML = (contentBlocks) => {
    if (!contentBlocks || contentBlocks.length === 0) {
      return '<p>Start writing your learning content here...</p>';
    }
    
    // Kita asumsikan hanya ada satu content block yang berisi semua HTML dari RichTextEditor
    const firstBlock = contentBlocks.sort((a, b) => a.order_index - b.order_index)[0];
    
    // Cek content object, lalu text_content
    if (firstBlock.content?.html) {
      return firstBlock.content.html;
    }
    
    // Fallback ke text_content (asumsikan mungkin sudah berbentuk HTML atau setidaknya text)
    return firstBlock.text_content || '<p>No content</p>';
  };

  // ✅ FIX: HANDLE SUBMIT - SIMPAN PART DAN CONTENT
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

      let partResponse;
      
      if (editingPart) {
        partResponse = await adminAPI.parts.update(editingPart.id, partData);
      } else {
        partResponse = await adminAPI.parts.create(partData);
      }

      console.log('✅ Part saved:', partResponse.data);
      const partId = partResponse.data.id;

      // 2. ✅ SIMPAN CONTENT KE CONTENT_BLOCKS
      const contentToSave = formData.content.trim();
      const defaultContent = '<p>Start writing your learning content here...</p>';
      
      if (contentToSave && contentToSave !== '<p></p>' && contentToSave !== defaultContent) {
        console.log('💾 Saving content blocks for part:', partId);
        await saveContentBlocks(partId, contentToSave, !!editingPart);
      } else {
        console.log('ℹ️ No content to save or empty content. Deleting old if editing.');
        if (editingPart) {
          // Jika konten dikosongkan saat edit, hapus content blocks lama
          await deleteContentBlocks(partId);
        }
      }

      setShowModal(false);
      resetForm();
      
      // 3. RELOAD PARTS UNTUK DAPAT CONTENT TERBARU
      if (selectedSection) {
        await fetchParts(selectedSection);
      }
      
      alert(`✅ Part ${editingPart ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('❌ FAILED TO SAVE PART:', error);
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // ✅ FUNCTION UNTUK DELETE SEMUA CONTENT BLOCKS
  const deleteContentBlocks = async (partId) => {
    try {
      console.log(`🗑️ Deleting all content blocks for part ${partId}`);
      const existingContent = await adminAPI.contentBlocks.getByPart(partId);
      for (let block of existingContent.data) {
        await adminAPI.contentBlocks.delete(partId, block.id);
      }
      console.log('✅ Old content blocks deleted');
    } catch (error) {
      // Not critical if it fails (e.g. no blocks exist)
      console.log('ℹ️ Error deleting existing content blocks (might not exist):', error.message);
    }
  };

  // UPDATE saveContentBlocks di AdminParts.jsx - GUNAKAN TYPE YANG VALID
  const saveContentBlocks = async (partId, htmlContent, isEditing = false) => {
    try {
      // Jika edit, hapus content blocks lama dulu (untuk menjaga hanya ada 1 block)
      if (isEditing) {
        await deleteContentBlocks(partId);
      }

      // ✅ GUNAKAN TYPE 'html' atau 'paragraph' yang bisa menyimpan konten HTML
      const contentBlockData = {
        type: 'paragraph', // Menggunakan 'paragraph' untuk konten utama
        content: { 
          html: htmlContent,
          text: stripHTML(htmlContent).substring(0, 200) + '...'
        },
        text_content: stripHTML(htmlContent),
        order_index: 1,
        // language: 'html', // Field language ini lebih untuk code block
        metadata: { 
          format: 'html',
          editor: 'RichTextEditor'
        }
      };

      console.log('📦 Content block data to save:', contentBlockData);
      
      // Simpan content block
      const response = await adminAPI.contentBlocks.create(partId, contentBlockData);
      console.log('✅ Content block saved successfully!', response.data);
      
    } catch (error) {
      console.error('❌ FAILED TO SAVE CONTENT BLOCK:', error);
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
    setEditingPart(part);
    
    // Pastikan part.content sudah terisi dari fetchParts
    const contentToEdit = part.content || '<p>Start writing your learning content here...</p>';
    
    setFormData({
      title: part.title,
      description: part.description || '',
      section_id: part.section_id,
      order_index: part.order_index,
      exp_reward: part.exp_reward,
      is_active: part.is_active,
      content: contentToEdit // Menggunakan content yang sudah di-load
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
        // 1. HAPUS CONTENT BLOCKS DULU
        await deleteContentBlocks(id);

        // 2. HAPUS PART
        await adminAPI.parts.delete(id);
        
        // 3. RELOAD DATA
        if (selectedSection) {
          await fetchParts(selectedSection);
        }
        
        alert('✅ Part deleted successfully!');
      } catch (error) {
        console.error('❌ Failed to delete part:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        alert(`Delete failed: ${errorMsg}`);
      }
    }
  };

  // ✅ FIX: TOGGLE ACTIVE
  const toggleActive = async (part) => {
    try {
      // Hanya kirim field yang diubah
      const updateData = {
        is_active: !part.is_active
      };

      await adminAPI.parts.update(part.id, updateData);
      
      // Update state secara lokal untuk respons yang cepat
      setParts(parts.map(p => 
        p.id === part.id ? { ...p, is_active: !p.is_active } : p
      ));

      // Opsional: fetchParts jika data lain mungkin berubah (misalnya, timestamp update)
      // if (selectedSection) {
      //   await fetchParts(selectedSection);
      // }
    } catch (error) {
      console.error('Failed to toggle part status:', error);
      alert('Failed to update part status');
    }
  };

  // ... (JSX render remains the same)
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

      {/* MODAL (JSX remains the same, using formData) */}
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