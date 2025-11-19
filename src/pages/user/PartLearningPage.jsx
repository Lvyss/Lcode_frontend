// src/pages/user/PartLearningPage.jsx - UPDATED WITH BADGE SYSTEM
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';
import ContentRenderer from '../../components/ContentRenderer';
import ExerciseComponent from '../../components/ExerciseComponent';
import BadgeModal from '../../components/BadgeModal'; // ✅ NEW COMPONENT

const PartLearningPage = () => {
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW STATES FOR BADGE SYSTEM
  const [newBadges, setNewBadges] = useState([]);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [exerciseStatus, setExerciseStatus] = useState({});

  useEffect(() => {
    fetchPartData();
  }, [id]);

  const fetchPartData = async () => {
    try {
      const [partRes, exercisesRes] = await Promise.all([
        userAPI.parts.getWithContent(id),
        userAPI.parts.getExercises(id)
      ]);
      
      setPart(partRes.data);
      setExercises(exercisesRes.data);
      
      // ✅ FETCH EXERCISE STATUS FOR EACH EXERCISE
      fetchExerciseStatuses(exercisesRes.data);
      
    } catch (error) {
      console.error('Failed to fetch part data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH EXERCISE STATUS (completed/correct)
  const fetchExerciseStatuses = async (exercisesList) => {
    const statusMap = {};
    
    for (const exercise of exercisesList) {
      try {
        const response = await userAPI.progress.getExerciseStatus(exercise.id);
        statusMap[exercise.id] = response.data;
      } catch (error) {
        console.error(`Failed to fetch status for exercise ${exercise.id}:`, error);
        statusMap[exercise.id] = { completed: false, is_correct: false };
      }
    }
    
    setExerciseStatus(statusMap);
  };

  // ✅ UPDATED HANDLE EXERCISE COMPLETE WITH BADGE SUPPORT
  const handleExerciseComplete = async (responseData) => {
    console.log('Exercise completed:', responseData);
    
    // ✅ UPDATE EXERCISE STATUS
    setExerciseStatus(prev => ({
      ...prev,
      [responseData.progress.exercise_id]: {
        completed: true,
        is_correct: responseData.is_correct,
        user_answer: responseData.progress.user_answer,
        completed_at: responseData.progress.completed_at
      }
    }));

    // ✅ CHECK IF BADGES WERE AWARDED
    if (responseData.awarded_badges && responseData.awarded_badges.length > 0) {
      setNewBadges(responseData.awarded_badges);
      setIsBadgeModalOpen(true);
      
      console.log('🎉 New badges awarded:', responseData.awarded_badges);
    }

    // ✅ REFRESH PART PROGRESS (optional - untuk update progress bars)
    // You can add progress refresh logic here if needed
  };

  // ✅ BADGE MODAL CLOSE HANDLER
  const handleBadgeModalClose = () => {
    setIsBadgeModalOpen(false);
    setNewBadges([]);
  };

  // ✅ CALCULATE PART PROGRESS
  const calculatePartProgress = () => {
    const completedExercises = Object.values(exerciseStatus).filter(
      status => status.completed && status.is_correct
    ).length;
    
    const totalExercises = exercises.length;
    const progressPercentage = totalExercises > 0 
      ? Math.round((completedExercises / totalExercises) * 100) 
      : 0;

    return {
      completed: completedExercises === totalExercises && totalExercises > 0,
      completedExercises,
      totalExercises,
      progressPercentage
    };
  };

  const partProgress = calculatePartProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading part content...</p>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-red-600">Part not found</div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ PART HEADER WITH PROGRESS */}
        <div className="p-6 mb-8 bg-white border shadow-sm rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{part.title}</h1>
              <p className="mt-2 text-gray-600">{part.description}</p>
              
              {/* ✅ PROGRESS BAR */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {partProgress.completedExercises}/{partProgress.totalExercises} exercises
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {partProgress.progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-3 transition-all duration-500 bg-green-500 rounded-full"
                    style={{ width: `${partProgress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* ✅ EXP REWARD */}
            {part.exp_reward > 0 && (
              <div className="ml-6 text-right">
                <div className="text-lg font-semibold text-yellow-600">
                  +{part.exp_reward} EXP
                </div>
                <div className="text-sm text-gray-500">Part Bonus</div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ CONTENT BLOCKS */}
        <div className="mb-8">
          <ContentRenderer contentBlocks={part.content_blocks} />
        </div>

        {/* ✅ EXERCISES SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Exercises</h2>
            <div className="text-sm text-gray-500">
              Complete all exercises to finish this part
            </div>
          </div>

          {exercises.length === 0 ? (
            <div className="py-8 text-center bg-white border rounded-lg">
              <div className="text-gray-500">No exercises available for this part</div>
            </div>
          ) : (
            exercises.map(exercise => (
              <ExerciseComponent 
                key={exercise.id} 
                exercise={exercise}
                exerciseStatus={exerciseStatus[exercise.id]}
                onComplete={handleExerciseComplete}
              />
            ))
          )}
        </div>
      </div>

      {/* ✅ BADGE MODAL */}
      <BadgeModal 
        isOpen={isBadgeModalOpen}
        onClose={handleBadgeModalClose}
        badges={newBadges}
      />
    </div>
  );
};

export default PartLearningPage;