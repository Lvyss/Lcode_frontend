// src/components/ExerciseComponent.jsx - FIXED MULTIPLE CHOICE
import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const ExerciseComponent = ({ exercise, onComplete }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
const [isCorrect, setIsCorrect] = useState(null);
  const [actualOutput, setActualOutput] = useState(''); // ✅ STATE BARU UNTUK OUTPUT
// ✅ CEK APAKAH EXERCISE SUDAH COMPLETED
useEffect(() => {
  checkExerciseStatus();
}, [exercise.id]);
const checkExerciseStatus = async () => {
  try {
    const response = await userAPI.progress.getExerciseStatus(exercise.id);
    
    // ✅ FIX: HANYA SET completed = true JIKA JAWABAN BENAR!
    if (response.data.completed && response.data.is_correct) {
      setCompleted(true);
      if (response.data.user_answer) {
        if (exercise.type === 'multiple_choice') {
          setSelectedOption(response.data.user_answer);
        } else {
          setUserAnswer(response.data.user_answer);
        }
      }
    } else {
      setCompleted(false);
    }
  } catch (error) {
    console.error('Failed to check exercise status:', error);
    setCompleted(false);
  }
};

// ✅ TAMBAHIN SETELAH useState declarations:
const isAnswerProvided = () => {
  switch (exercise.type) {
    case 'multiple_choice':
      return !!selectedOption;
    case 'fill_blank':
      return userAnswer && userAnswer.split('|').every(answer => answer.trim() !== '');
    default:
      return !!userAnswer && userAnswer.trim() !== '';
  }
};
// ✅ COMPLETE FIXED handleSubmit
const handleSubmit = async () => {
  try {
    setLoading(true);
    setActualOutput(''); // Reset output setiap submit
    
    let answerToSubmit = '';
    if (exercise.type === 'multiple_choice') {
      answerToSubmit = selectedOption;
    } else {
      answerToSubmit = userAnswer;
    }
    
    console.log('Submitting:', { type: exercise.type, answer: answerToSubmit });
    
    let response;
    if (exercise.type === 'code_test') {
      // ✅ SPECIAL ENDPOINT UNTUK CODE EXECUTION
      response = await userAPI.exercises.checkCodeTest({
        exercise_id: exercise.id,
        user_answer: answerToSubmit
      });
      
      // ✅ SET ACTUAL OUTPUT UNTUK DITAMPILKAN
      setActualOutput(response.data.actual_output || '(No output)');
    } else {
      // ✅ STANDARD ENDPOINT UNTUK LAINNYA
      response = await userAPI.progress.completeExercise({
        exercise_id: exercise.id,
        user_answer: answerToSubmit
      });
    }
    
    console.log('Server response:', response.data);
    
    // ✅ UPDATE STATE
    setIsCorrect(response.data.is_correct);
    setCompleted(response.data.is_correct);
    
    if (onComplete) {
      onComplete(response.data);
    }
    
  } catch (error) {
    console.error('Submission failed:', error);
    setIsCorrect(false);
    setActualOutput('(Execution failed)');
    
    // ✅ SHOW ERROR MESSAGE
    if (error.response?.data?.error) {
      alert(`Execution error: ${error.response.data.error}`);
    }
  } finally {
    setLoading(false);
  }
};
// ✅ IMPROVED FILL BLANK - INPUT FIELD LANGSUNG (OPTIONAL)
const handleFillBlankClick = (blankIndex) => {
  const answer = prompt(`Enter answer for blank ${blankIndex + 1}:`);
  if (answer !== null) { // ✅ Handle jika user cancel prompt
    setUserAnswer(prev => {
      const answers = prev ? prev.split('|') : [];
      // ✅ Pastikan array cukup panjang
      while (answers.length <= blankIndex) {
        answers.push('');
      }
      answers[blankIndex] = answer;
      return answers.join('|');
    });
  }
};




// ✅ FIXED: RENDER FILL BLANK EXERCISE
const renderFillBlank = () => {
  const blanks = exercise.question.match(/_{1,}/g) || [];
  let questionParts = exercise.question.split(/(_{1,})/);

  const handleBlankChange = (blankIndex, value) => {
    setUserAnswer(prev => {
      const answers = prev ? prev.split('|') : [];
      // ✅ PASTIKAN ARRAY CUKUP PANJANG
      while (answers.length <= blankIndex) {
        answers.push('');
      }
      answers[blankIndex] = value;
      return answers.join('|');
    });
  };

  return (
    <div className="mb-4">
      <p className="text-gray-700 mb-4">Fill in the blanks:</p>
      <div className="p-4 bg-gray-50 rounded-lg leading-8">
        {questionParts.map((part, index) => {
          if (part.match(/_{1,}/)) {
            const blankIndex = questionParts.slice(0, index).filter(p => p.match(/_{1,}/)).length;
            const userAnswerPart = userAnswer ? userAnswer.split('|')[blankIndex] || '' : '';
            
            return (
              <span key={index}>
                <input
                  type="text"
                  value={userAnswerPart}
                  onChange={(e) => handleBlankChange(blankIndex, e.target.value)}
                  className="w-24 px-2 py-1 mx-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                  placeholder="______"
                  disabled={loading || completed}
                />
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
      
      {userAnswer && (
        <div className="mt-3 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Your answers:</strong> {userAnswer.split('|').join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

// ✅ PINDAHKAN useEffect KE LEVEL KOMPONEN UTAMA
useEffect(() => {
  if (exercise.type === 'fill_blank') {
    const blanks = exercise.question.match(/_{1,}/g) || [];
    if (!userAnswer && blanks.length > 0) {
      setUserAnswer(Array(blanks.length).fill('').join('|'));
    }
  } else if (exercise.type === 'code_test') {
    // ✅ RESET USER ANSWER UNTUK CODE TEST
    setUserAnswer('');
  }
}, [exercise.id, exercise.type, exercise.question]);

  // ✅ FIXED: RENDER MULTIPLE CHOICE EXERCISE
  const renderMultipleChoice = () => {
    // ✅ HANDLE BOTH STRING ARRAY AND OBJECT ARRAY
    let options = [];
    
    if (exercise.solution && exercise.solution.options) {
      // Jika options adalah array of objects, extract text
      if (typeof exercise.solution.options[0] === 'object') {
        options = exercise.solution.options.map(opt => 
          typeof opt === 'object' ? opt.text || opt.id || JSON.stringify(opt) : opt
        );
      } else {
        // Jika options adalah array of strings
        options = exercise.solution.options;
      }
    } else {
      // Fallback options
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    
    return (
      <div className="mb-4">
        <p className="text-gray-700 mb-4">{exercise.question}</p>
        <div className="space-y-2">
          {options.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                 disabled={completed} // ✅ INI YANG PENTING
                name={`exercise-${exercise.id}`}
                value={option}
                checked={selectedOption === option}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                {option} {/* ✅ SEKARANG OPTION PASTI STRING */}
              </span>
            </label>
          ))}
        </div>
        
        {selectedOption && (
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedOption}
            </p>
          </div>
        )}
      </div>
    );
  };

// ✅ IMPROVED: RENDER CODE TEST EXERCISE
const renderCodeTest = () => {
  return (
    <div className="mb-4">
      <p className="text-gray-700 mb-4">{exercise.question}</p>
      
      {exercise.code_template && (
        <div className="p-4 mb-4 bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Code Template:</h4>
          <pre className="text-sm text-green-400 overflow-x-auto">
            {exercise.code_template}
          </pre>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Complete the code at <code>____</code>:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          rows={6}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          placeholder="Write the missing code here (e.g., cout << 'Hello World';)"
          disabled={loading || completed}
        />
      </div>

      {/* ✅ SHOW EXPECTED OUTPUT */}
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Expected Output:</strong> {exercise.solution.expected_output}
        </p>
      </div>
    </div>
  );
};

  // ✅ RENDER DEFAULT TEXT EXERCISE
  const renderDefault = () => {
    return (
      <div className="mb-4">
        <p className="text-gray-700 mb-4">{exercise.question}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type your answer here..."
            disabled={loading || completed}
          />
        </div>
      </div>
    );
  };

  // ✅ MAIN RENDERER BERDASARKAN EXERCISE TYPE
  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'fill_blank':
        return renderFillBlank();
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'code_test':
        return renderCodeTest();
      default:
        return renderDefault();
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  // ✅ RENDER FILL BLANK READ-ONLY
const renderFillBlankReadOnly = () => {
  const blanks = exercise.question.match(/_{1,}/g) || [];
  let questionParts = exercise.question.split(/(_{1,})/);
}
// ✅ JIKA SUDAH COMPLETED, TAMPILKAN READ-ONLY
if (completed) {
  return (
    <div className="p-6 border-2 border-green-500 rounded-lg bg-green-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-green-800">✅ Completed!</h3>
          <p className="text-green-700">You earned {exercise.exp_reward || 15} EXP</p>
        </div>
        <span className="text-2xl">🎉</span>
      </div>

      {/* ✅ TAMPILKAN QUESTION & ANSWER YANG SUDAH DIJAWAB */}
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-2">Your Solution:</h4>
        
        {exercise.type === 'multiple_choice' && (
          <div>
            <p className="text-gray-700 mb-2">{exercise.question}</p>
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-blue-800">
                <strong>Your answer:</strong> {selectedOption}
              </p>
            </div>
          </div>
        )}

        {exercise.type === 'fill_blank' && renderFillBlankReadOnly()}

        {exercise.type === 'code_test' && (
          <div>
            <p className="text-gray-700 mb-2">{exercise.question}</p>
            <div className="p-3 bg-green-100 rounded">
              <p className="text-green-800 font-mono text-sm">
                <strong>Your code:</strong> {userAnswer}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ TOMBOL UNTUK REVIEW SAJA */}
      <button
        onClick={() => setCompleted(false)}
        className="mt-4 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
      >
        Review Exercise
      </button>
    </div>
  );
}



return (
  <div className="p-6 bg-white border rounded-lg shadow">
    {/* Exercise Header */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Exercise</h3>
        <span className="text-sm text-gray-500 capitalize">{exercise.type?.replace('_', ' ')}</span>
      </div>
      <div className="flex items-center space-x-2">
        {completed && (
          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            ✅ Completed
          </span>
        )}
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
          {exercise.difficulty || 'easy'}
        </span>
      </div>
    </div>

    {/* Exercise Content - Dynamic berdasarkan type */}
    {renderExerciseContent()}

{!completed && isCorrect === false && (
  <div className="mb-4 p-3 border border-red-200 rounded bg-red-50">
    <p className="text-sm text-red-800 mb-2">
      ❌ <strong>Jawaban salah!</strong> Coba lagi atau gunakan hint.
    </p>
    
    {/* ✅ TAMPILKAN OUTPUT COMPARISON UNTUK CODE TEST */}
    {exercise.type === 'code_test' && (
      <div className="mt-2 p-2 bg-red-100 rounded text-xs">
        <p><strong>Expected Output:</strong> {exercise.solution.expected_output}</p>
        <p><strong>Your Output:</strong> {actualOutput || 'No output'}</p>
      </div>
    )}
  </div>
)}

{!completed && isCorrect === true && (
  <div className="mb-4 p-3 border border-green-200 rounded bg-green-50">
    <p className="text-sm text-green-800 mb-2">
      ✅ <strong>Jawaban benar!</strong> Lanjut ke exercise berikutnya.
    </p>
    
    {/* ✅ TAMPILKAN OUTPUT COMPARISON UNTUK CODE TEST */}
    {exercise.type === 'code_test' && (
      <div className="mt-2 p-2 bg-green-100 rounded text-xs">
        <p><strong>Expected Output:</strong> {exercise.solution.expected_output}</p>
        <p><strong>Your Output:</strong> {actualOutput}</p>
      </div>
    )}
  </div>
)}
    {/* Hint Section - Hanya tampil jika belum completed */}
    {!completed && exercise.hint && (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        {showHint && (
          <div className="p-3 mt-2 border border-yellow-200 rounded bg-yellow-50">
            <p className="text-sm text-yellow-800">{exercise.hint}</p>
          </div>
        )}
      </div>
    )}

    {/* Submit Button - Hanya tampil jika belum completed */}
{!completed && (
  <button
    onClick={handleSubmit} // ✅ TANPA PARAMETER!
    disabled={loading || !isAnswerProvided()} // ✅ TAMBAH VALIDATION
    className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? 'Submitting...' : 'Submit Answer'}
  </button>
)}

    {/* Review Button - Hanya tampil jika sudah completed */}
    {completed && (
      <div className="flex space-x-3">
        <button
          onClick={() => setCompleted(false)}
          className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Review Exercise
        </button>
        <button
          onClick={() => window.location.reload()} // atau navigate ke exercise lain
          className="px-4 py-2 text-green-600 border border-green-600 rounded-md hover:bg-green-50"
        >
          Next Exercise
        </button>
      </div>
    )}
  </div>
);
};

export default ExerciseComponent;