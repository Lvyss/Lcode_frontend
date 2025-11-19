// src/components/TreeVisualization.jsx
import React from 'react';

const TreeVisualization = ({ treeData, userStats }) => {
  const { current_stage, next_stage, progress_to_next, total_exp } = treeData;

  const getTreeImage = (stage) => {
    const images = {
      seed: '🌱',
      sprout: '🌿', 
      small_tree: '🌳',
      big_tree: '🌲',
      ancient_tree: '🎄'
    };
    return images[stage?.stage] || '🌱';
  };

  const getStageColor = (stage) => {
    const colors = {
      seed: 'from-yellow-100 to-yellow-300',
      sprout: 'from-green-100 to-green-300',
      small_tree: 'from-emerald-100 to-emerald-400',
      big_tree: 'from-teal-100 to-teal-500',
      ancient_tree: 'from-purple-100 to-purple-600'
    };
    return colors[stage?.stage] || 'from-gray-100 to-gray-300';
  };

  return (
    <div className="text-center">
      {/* CURRENT TREE DISPLAY */}
      <div className={`bg-gradient-to-br ${getStageColor(current_stage)} rounded-2xl p-8 mb-6`}>
        <div className="mb-4 text-8xl">
          {getTreeImage(current_stage)}
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">
          {current_stage?.name || 'Benih'}
        </h2>
        <p className="mb-4 text-gray-600">
          {current_stage?.description || 'Mulai petualangan coding-mu!'}
        </p>
        
        {/* PROGRESS BAR */}
        {next_stage && (
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>{current_stage?.name}</span>
              <span>{next_stage?.name}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full">
              <div 
                className="h-4 transition-all duration-500 bg-indigo-600 rounded-full"
                style={{ width: `${progress_to_next}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {total_exp} EXP • {progress_to_next.toFixed(1)}% menuju {next_stage?.name}
            </div>
          </div>
        )}
      </div>

      {/* STAGE INFO */}
      <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900">Stage Saat Ini</h3>
          <p className="text-sm text-gray-600">{current_stage?.name}</p>
        </div>
        
        {next_stage ? (
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-900">Stage Berikutnya</h3>
            <p className="text-sm text-gray-600">{next_stage.name}</p>
            <p className="text-xs text-gray-500">
              Butuh {next_stage.min_exp - total_exp} EXP lagi
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-900">Pencapaian Maksimal!</h3>
            <p className="text-sm text-gray-600">Kamu sudah mencapai stage tertinggi!</p>
          </div>
        )}
        
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900">Total EXP</h3>
          <p className="text-2xl font-bold text-indigo-600">{total_exp}</p>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualization;