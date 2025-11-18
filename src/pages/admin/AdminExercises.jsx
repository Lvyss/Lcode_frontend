// src/pages/admin/AdminExercises.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [parts, setParts] = useState([]);
  const [sections, setSections] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedPart, setSelectedPart] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
// ✅ TAMBAHIN STATE UNTUK TRACK BLANKS
const [blankCount, setBlankCount] = useState(0);
const [correctAnswers, setCorrectAnswers] = useState([]);

// ✅ FIX: UBAH REGEX UNTUK DETECT 1 ATAU LEBIH UNDERSCORE
const detectBlanks = (question) => {
  const blanks = question.match(/_{1,}/g) || []; // ✅ UBAH: {1,} bukan {2,}
  return blanks.length;
};


// ✅ FIX: IMPROVED handleQuestionChange UNTUK HANDLE SEMUA KASUS
const handleQuestionChange = (e) => {
  const newQuestion = e.target.value;
  const newBlankCount = detectBlanks(newQuestion);
  const currentBlankCount = blankCount;
  
  setFormData(prev => ({
    ...prev,
    question: newQuestion
  }));
  
  setBlankCount(newBlankCount);
  
  // ✅ HANDLE PERUBAHAN JUMLAH BLANKS
  if (newBlankCount !== currentBlankCount) {
    let newAnswers;
    
    if (newBlankCount > currentBlankCount) {
      // ✅ JIKA NAMBAH BLANKS: TAMBAH ANSWER KOSONG
      newAnswers = [...correctAnswers, ...Array(newBlankCount - currentBlankCount).fill('')];
    } else {
      // ✅ JIKA KURANGI BLANKS: HAPUS ANSWER TERAKHIR
      newAnswers = correctAnswers.slice(0, newBlankCount);
    }
    
    setCorrectAnswers(newAnswers);
    
    // ✅ UPDATE SOLUTION DENGAN ANSWERS YANG BARU
    setFormData(prev => ({
      ...prev,
      solution: {
        ...prev.solution,
        fill_blank: {
          correct_answer: newAnswers.join('|')
        }
      }
    }));
  }
  // ✅ JIKA JUMLAH BLANKS SAMA, TAPI QUESTION BERUBAH - UPDATE SOLUTION JUGA
  else if (newBlankCount > 0) {
    setFormData(prev => ({
      ...prev,
      solution: {
        ...prev.solution,
        fill_blank: {
          correct_answer: correctAnswers.join('|')
        }
      }
    }));
  }
};
// ✅ FIX: HANDLE PERUBAHAN INDIVIDUAL ANSWER
const handleCorrectAnswerChange = (index, value) => {
  const newAnswers = [...correctAnswers];
  newAnswers[index] = value;
  setCorrectAnswers(newAnswers);
  
  // ✅ UPDATE SOLUTION SETIAP KALI ANSWER BERUBAH
  setFormData(prev => ({
    ...prev,
    solution: {
      ...prev.solution,
      fill_blank: {
        correct_answer: newAnswers.join('|')
      }
    }
  }));
};

// ✅ FIX: UPDATE PREVIEW COMPONENT UNTUK 1+ UNDERSCORE
const FillBlankPreview = ({ question, correctAnswers }) => {
  if (!question) return null;
  
  const parts = question.split(/(_{1,})/); // ✅ UBAH: {1,} bukan {2,}
  
  return (
    <div className="p-4 mt-2 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
      <div className="text-gray-800 leading-7">
        {parts.map((part, index) => {
          if (part.match(/_{1,}/)) {
            const blankIndex = parts.slice(0, index).filter(p => p.match(/_{1,}/)).length;
            const answer = correctAnswers[blankIndex] || '______';
            return (
              <span key={index} className="mx-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded">
                {answer}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
};

// ✅ FIX: FORM STATE - HAPUS validation_type & test_cases
const [formData, setFormData] = useState({
  question: '',
  type: 'multiple_choice',
  solution: {
    multiple_choice: { options: [], correct_answer: '' },
    fill_blank: { correct_answer: '' },
    code_test: { expected_output: '' } // ✅ SIMPLE!
  },
  code_template: '',
  hint: '',
  part_id: '',
  exp_reward: 10,
  difficulty: 'easy',
  order_index: 1
});

// ✅ FIX: TAMBAHIN useEffect UNTUK HANDLE CREATE MODE
useEffect(() => {
  if (showModal && !editingExercise) {
    // ✅ UNTUK CREATE MODE: AUTO DETECT BLANKS DARI QUESTION
    const count = detectBlanks(formData.question);
    setBlankCount(count);
    
    if (count > 0) {
      const newAnswers = Array(count).fill('');
      setCorrectAnswers(newAnswers);
      
      // ✅ AUTO UPDATE SOLUTION
      setFormData(prev => ({
        ...prev,
        solution: {
          ...prev.solution,
          fill_blank: {
            correct_answer: newAnswers.join('|')
          }
        }
      }));
    } else {
      setCorrectAnswers([]);
    }
  }
}, [showModal, editingExercise, formData.question]);

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

  useEffect(() => {
    if (selectedPart) {
      fetchExercises(selectedPart);
    }
  }, [selectedPart]);

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

  const fetchParts = async (sectionId) => {
    try {
      const response = await adminAPI.parts.getBySection(sectionId);
      setParts(response.data);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    }
  };

  // ✅ FIX: FETCH EXERCISES BY PART
  const fetchExercises = async (partId) => {
    try {
      const response = await adminAPI.exercises.getByPart(partId);
      setExercises(response.data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

// ✅ FIX METHOD INI - GANTI YANG LAMA!
const prepareSolutionData = (formData) => {
  const { type, solution } = formData;
  
  switch (type) {
    case 'multiple_choice':
      return {
        options: solution.multiple_choice.options.map((text, index) => ({
          id: index + 1,
          text: text,
          correct: index === solution.multiple_choice.correct_answer
        })),
        correct_answer: solution.multiple_choice.correct_answer
      };
      
    case 'fill_blank':
      // ✅ FIX: GUNAKAN expected_answers, BUKAN correct_answer!
      const correctAnswer = solution.fill_blank.correct_answer || '';
      const blankCount = detectBlanks(formData.question);
      
      // ✅ VALIDASI: JIKA BLANK COUNT > 0, PASTIKAN correct_answer ADA
      if (blankCount > 0 && !correctAnswer) {
        alert(`Please fill all ${blankCount} correct answers for the blanks!`);
        throw new Error('Missing correct answers for fill blank');
      }
      
      // ✅ CONVERT KE expected_answers ARRAY
      const expectedAnswers = correctAnswer ? correctAnswer.split('|') : [];
      
      return {
        expected_answers: expectedAnswers // ✅ INI YANG BARU!
      };
      
    case 'code_test':
      return {
        expected_output: solution.code_test.expected_output,
      };
      
    default:
      return {};
  }
};

// ✅ FIX: UPDATE handleSubmit DENGAN VALIDATION TAMBAHAN
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // ✅ VALIDASI TAMBAHAN UNTUK FILL BLANK
    if (formData.type === 'fill_blank') {
      const blankCount = detectBlanks(formData.question);
      const answerCount = formData.solution.fill_blank.correct_answer.split('|').length;
      
      if (blankCount !== answerCount) {
        alert(`❌ Error: You have ${blankCount} blanks but ${answerCount} answers. Please provide answers for all blanks!`);
        return;
      }
      
      // ✅ VALIDASI ANSWER TIDAK BOLEH KOSONG
      const answers = formData.solution.fill_blank.correct_answer.split('|');
      const emptyAnswers = answers.filter(answer => !answer.trim());
      
      if (emptyAnswers.length > 0) {
        alert(`❌ Error: Please fill all correct answers! Blank ${answers.findIndex(answer => !answer.trim()) + 1} is empty.`);
        return;
      }
    }
    
    const solutionData = prepareSolutionData(formData);
    
    const exerciseData = {
      part_id: formData.part_id,
      type: formData.type,
      question: formData.question,
      solution: solutionData,
      code_template: formData.code_template || null,
      hint: formData.hint || null,
      difficulty: formData.difficulty,
      exp_reward: formData.exp_reward,
      order_index: formData.order_index
    };

    console.log('📤 Sending to backend:', exerciseData);

    if (editingExercise) {
      await adminAPI.exercises.update(editingExercise.id, exerciseData);
    } else {
      await adminAPI.exercises.create(exerciseData);
    }

    setShowModal(false);
    resetForm();
    if (selectedPart) {
      fetchExercises(selectedPart);
    }
    
    alert('✅ Exercise saved successfully!');
  } catch (error) {
    console.error('❌ Failed to save exercise:', error);
    if (!error.message.includes('Missing correct answers')) {
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    }
  }
};

// ✅ FIX: TAMBAH TRY-CATCH DI handleEdit
const handleEdit = (exercise) => {
  try {
    console.log('🔄 Starting edit for exercise:', exercise);
    
    setEditingExercise(exercise);
    
    let solutionData = {
      multiple_choice: { options: [], correct_answer: '' },
      fill_blank: { correct_answer: '' },
      code_test: { expected_output: '' }
    };
    
    // ✅ HANDLE FILL BLANK - DENGAN ERROR HANDLING
    if (exercise.type === 'fill_blank') {
      console.log('📝 Editing fill_blank exercise:', exercise.solution);
      
      const blankCount = detectBlanks(exercise.question);
      let answers = [];
      
      // ✅ CEK APAKAH PAKAI expected_answers ATAU correct_answer
      if (exercise.solution?.expected_answers) {
        answers = exercise.solution.expected_answers;
        console.log('✅ Using expected_answers:', answers);
      } else if (exercise.solution?.correct_answer) {
        answers = exercise.solution.correct_answer.split('|');
        console.log('✅ Using correct_answer:', answers);
      } else {
        console.log('⚠️ No solution data found, using empty array');
        answers = Array(blankCount).fill('');
      }
      
      // ✅ PASTIKAN PANJANG ANSWERS SAMA DENGAN BLANK COUNT
      if (answers.length !== blankCount) {
        console.log(`🔄 Adjusting answers from ${answers.length} to ${blankCount} blanks`);
        if (answers.length < blankCount) {
          answers = [...answers, ...Array(blankCount - answers.length).fill('')];
        } else {
          answers = answers.slice(0, blankCount);
        }
      }
      
      solutionData.fill_blank = {
        correct_answer: answers.join('|')
      };
      
      setBlankCount(blankCount);
      setCorrectAnswers(answers);
      console.log('✅ Final fill_blank data:', solutionData.fill_blank);
    } 
    // ✅ HANDLE MULTIPLE CHOICE
    else if (exercise.type === 'multiple_choice' && exercise.solution?.options) {
      console.log('📝 Editing multiple_choice exercise:', exercise.solution);
      
      const options = exercise.solution.options.map(opt => opt.text || opt);
      const correctIndex = exercise.solution.options.findIndex(opt => opt.correct);
      
      solutionData.multiple_choice = {
        options: options,
        correct_answer: correctIndex >= 0 ? correctIndex : ''
      };
      
      setBlankCount(0);
      setCorrectAnswers([]);
      console.log('✅ Final multiple_choice data:', solutionData.multiple_choice);
    } 
    // ✅ HANDLE CODE TEST
    else if (exercise.type === 'code_test' && exercise.solution) {
      console.log('📝 Editing code_test exercise:', exercise.solution);
      
      solutionData.code_test = {
        expected_output: exercise.solution.expected_output || ''
      };
      
      setBlankCount(0);
      setCorrectAnswers([]);
      console.log('✅ Final code_test data:', solutionData.code_test);
    } else {
      console.log('⚠️ Unknown exercise type or missing solution:', exercise.type, exercise.solution);
      setBlankCount(0);
      setCorrectAnswers([]);
    }

    // ✅ SET FORM DATA
    setFormData({
      question: exercise.question || '',
      type: exercise.type || 'multiple_choice',
      solution: solutionData,
      code_template: exercise.code_template || '',
      hint: exercise.hint || '',
      part_id: exercise.part_id || selectedPart || '',
      exp_reward: exercise.exp_reward || 10,
      difficulty: exercise.difficulty || 'easy',
      order_index: exercise.order_index || 1
    });

    console.log('✅ Form data set successfully, opening modal...');
    setShowModal(true);
    
  } catch (error) {
    console.error('❌ Error in handleEdit:', error);
    alert(`Failed to edit exercise: ${error.message}`);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await adminAPI.exercises.delete(id);
        if (selectedPart) {
          fetchExercises(selectedPart);
        }
      } catch (error) {
        console.error('Failed to delete exercise:', error);
        alert(`Delete failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

// ✅ FIX: DYNAMIC OPTIONS HANDLING - UPDATE VERSION
const addOption = () => {
  setFormData({
    ...formData,
    solution: {
      ...formData.solution,
      multiple_choice: {
        ...formData.solution.multiple_choice,
        options: [...formData.solution.multiple_choice.options, '']
      }
    }
  });
};

const updateOption = (index, value) => {
  const newOptions = [...formData.solution.multiple_choice.options];
  newOptions[index] = value;
  setFormData({
    ...formData,
    solution: {
      ...formData.solution,
      multiple_choice: {
        ...formData.solution.multiple_choice,
        options: newOptions
      }
    }
  });
};

const removeOption = (index) => {
  const newOptions = formData.solution.multiple_choice.options.filter((_, i) => i !== index);
  setFormData({
    ...formData,
    solution: {
      ...formData.solution,
      multiple_choice: {
        ...formData.solution.multiple_choice,
        options: newOptions
      }
    }
  });
};

const resetForm = () => {
  setEditingExercise(null);
  setBlankCount(0);
  setCorrectAnswers([]);
  setFormData({
    question: '',
    type: 'multiple_choice',
    solution: {
      multiple_choice: { options: [], correct_answer: '' },
      fill_blank: { correct_answer: '' },
      code_test: { expected_output: '' } // ✅ SIMPLE!
    },
    code_template: '',
    hint: '',
    part_id: selectedPart || '',
    exp_reward: 10,
    difficulty: 'easy',
    order_index: exercises.length + 1
  });
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Exercises</h1>
        <p className="text-gray-600">Create coding exercises and challenges</p>
      </div>

      {/* FILTER SECTION */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setSelectedSection('');
                setSelectedPart('');
                setExercises([]);
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
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedPart('');
                setExercises([]);
              }}
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Part</label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedSection}
            >
              <option value="">Choose part...</option>
              {parts.map(part => (
                <option key={part.id} value={part.id}>
                  {part.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
<button 
  onClick={() => {
    if (!selectedPart) {
      alert('Please select a part first');
      return;
    }
    
    // ✅ RESET FORM DENGAN STATE YANG BERSIH
    resetForm();
    
    // ✅ SET part_id DAN order_index
    setFormData(prev => ({
      ...prev,
      part_id: selectedPart,
      order_index: exercises.length + 1
    }));
    
    setShowModal(true);
  }}
  className="w-full px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={!selectedPart}
>
  Add Exercise
</button>
          </div>
        </div>
      </div>

      {/* EXERCISES TABLE */}
      {selectedPart && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Exercises in {parts.find(p => p.id == selectedPart)?.title}
                <span className="ml-2 text-sm text-gray-500">({exercises.length} exercises)</span>
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Question</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">EXP</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td className="px-6 py-4">
                      <div className="max-w-md text-sm font-medium text-gray-900 truncate">
                        {exercise.question}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                        {exercise.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exercise.exp_reward} EXP</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exercise.order_index}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <button 
                        onClick={() => handleEdit(exercise)}
                        className="mr-4 text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(exercise.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {exercises.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No exercises found for this part. Create your first exercise!
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
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.question}
                     onChange={handleQuestionChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the exercise question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="code_test">Code Test</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                {/* DYNAMIC FIELDS BASED ON EXERCISE TYPE */}
{formData.type === 'multiple_choice' && (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">Options *</label>
    {/* ✅ FIX: PAKE multiple_choice.options */}
    {formData.solution.multiple_choice.options.map((option, index) => (
      <div key={index} className="flex mb-2 space-x-2">
        <input
          type="text"
          value={option}
          onChange={(e) => updateOption(index, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={`Option ${index + 1}`}
          required
        />
        {formData.solution.multiple_choice.options.length > 1 && (
          <button
            type="button"
            onClick={() => removeOption(index)}
            className="px-3 py-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200"
          >
            Remove
          </button>
        )}
      </div>
    ))}
    <button
      type="button"
      onClick={addOption}
      className="px-4 py-2 mt-2 text-green-600 bg-green-100 rounded-md hover:bg-green-200"
    >
      Add Option
    </button>

    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Correct Answer *</label>
      <select
        value={formData.solution.multiple_choice.correct_answer}
        onChange={(e) => setFormData({
          ...formData, 
          solution: {
            ...formData.solution,
            multiple_choice: {
              ...formData.solution.multiple_choice,
              correct_answer: parseInt(e.target.value)
            }
          }
        })}
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        required
      >
        <option value="">Select correct option</option>
        {formData.solution.multiple_choice.options.map((_, index) => (
          <option key={index} value={index}>Option {index + 1}</option>
        ))}
      </select>
    </div>
  </div>
)}

{formData.type === 'fill_blank' && (
  <div>
    <div className="mb-3">
      <p className="text-sm text-gray-600">
        💡 <strong>Tip:</strong> Gunakan <code>_</code> (1 underscore atau lebih) untuk membuat blank space
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Contoh: "Untuk menampilkan teks di C++ gunakan <code>_</code> dan diakhiri dengan <code>_</code>"
      </p>
    </div>

    {/* ✅ PREVIEW REAL-TIME */}
    <FillBlankPreview 
      question={formData.question} 
      correctAnswers={correctAnswers} 
    />

    {/* ✅ DYNAMIC CORRECT ANSWER FIELDS BERDASARKAN BLANK COUNT */}
    {blankCount > 0 && (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answers ({blankCount} blanks detected):
        </label>
        <div className="space-y-2">
          {Array.from({ length: blankCount }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 w-8">
                Blank {index + 1}:
              </span>
              <input
                type="text"
                value={correctAnswers[index] || ''}
                onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Answer for blank ${index + 1}`}
                required
              />
            </div>
          ))}
        </div>
        
        {/* ✅ CURRENT SOLUTION PREVIEW */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
          <strong>Solution format:</strong> {formData.solution.fill_blank.correct_answer || 'empty'}
        </div>
      </div>
    )}

    {/* ✅ JIKA BELUM ADA BLANKS */}
    {blankCount === 0 && formData.question && (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          ⚠️ No blanks detected. Add <code>_</code> (1 underscore) in your question to create fill-in-the-blank exercises.
        </p>
      </div>
    )}
  </div>
)}

{formData.type === 'code_test' && (
  <div className="space-y-4">
    {/* ✅ CODE TEMPLATE */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Code Template *
      </label>
      <textarea
        rows={8}
        required
        value={formData.code_template}
        onChange={(e) => setFormData({...formData, code_template: e.target.value})}
        className="block w-full px-3 py-2 mt-1 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={`Contoh untuk C++:\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Student akan melengkapi kode di sini\n    ____\n    return 0;\n}`}
      />
      <p className="text-xs text-gray-500 mt-1">
        💡 Gunakan <code>____</code> untuk bagian yang harus diisi student
      </p>
    </div>

    {/* ✅ PREVIEW CODE TEMPLATE */}
    {formData.code_template && (
      <div className="p-4 bg-gray-900 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Preview Code:</h4>
        <pre className="text-sm text-green-400 overflow-x-auto">
          {formData.code_template}
        </pre>
      </div>
    )}

    {/* ✅ EXPECTED OUTPUT */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Expected Output *
      </label>
      <input
        type="text"
        required
        value={formData.solution.code_test.expected_output}
        onChange={(e) => setFormData({
          ...formData,
          solution: {
            ...formData.solution,
            code_test: {
              expected_output: e.target.value
            }
          }
        })}
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Output yang diharapkan (contoh: Hello World)"
      />
      <p className="text-xs text-gray-500 mt-1">
        System akan cek apakah output kode student sama dengan ini
      </p>
    </div>

    {/* ✅ PREVIEW FINAL SETUP */}
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Setup Code Test:</h4>
      <div className="text-sm text-blue-700 space-y-1">
        <p><strong>Template:</strong> {formData.code_template ? '✅ Ada' : '❌ Belum diisi'}</p>
        <p><strong>Expected Output:</strong> {formData.solution.code_test.expected_output || '❌ Belum diisi'}</p>
      </div>
    </div>
  </div>
)}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Hint</label>
                  <textarea
                    rows={2}
                    value={formData.hint}
                    onChange={(e) => setFormData({...formData, hint: e.target.value})}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Optional hint to help students..."
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
                  {editingExercise ? 'Update Exercise' : 'Create Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExercises;