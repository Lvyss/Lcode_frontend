// src/pages/user/PartLearningPage.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../../services/api';
import ContentRenderer from '../../components/ContentRenderer';
import ExerciseComponent from '../../components/ExerciseComponent';

const PartLearningPage = () => {
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      // ✅ HAPUS AUTO-COMPLETE PART! Sekarang part cuma complete kalo semua exercise selesai
      // await userAPI.progress.completePart({ part_id: parseInt(id) }); // ❌ HAPUS BARIS INI!
      
    } catch (error) {
      console.error('Failed to fetch part data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = (responseData) => {
    console.log('Exercise completed:', responseData);
    // Bisa refresh data atau update UI di sini
  };

  if (loading) return <div>Loading...</div>;
  if (!part) return <div>Part not found</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{part.title}</h1>
          <p className="text-gray-600">{part.description}</p>
        </div>

        {/* Render Content Blocks */}
        <div className="mb-8">
          <ContentRenderer contentBlocks={part.content_blocks} />
        </div>

        {/* Render Exercises */}
        <div className="space-y-6">
          {exercises.map(exercise => (
            <ExerciseComponent 
              key={exercise.id} 
              exercise={exercise}
              onComplete={handleExerciseComplete} // ✅ PAKAI onComplete BUKAN auto-complete
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartLearningPage;