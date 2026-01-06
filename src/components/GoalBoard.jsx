import React, { useState, useEffect } from 'react';
import { Plus, Target } from 'lucide-react';
import Goal from './Goal';
import GoalDetail from './GoalDetail';
import GoalForm from './GoalForm';
import { useGoals } from '../hooks/useGoals';

/**
 * Main goal board component displaying goals in different views
 */
const GoalBoard = ({ tasks = [] }) => {
  const {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    toggleSubGoalComplete,
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    getArchivedGoals,
    deleteArchivedGoal
  } = useGoals();

  const [view, setView] = useState('active'); // active | paused | archive
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Keep selectedGoal in sync with goals array
  useEffect(() => {
    if (selectedGoal) {
      const updatedGoal = goals.find(g => g.id === selectedGoal.id);
      if (updatedGoal) {
        setSelectedGoal(updatedGoal);
      }
    }
  }, [goals]);

  const handlePause = (id) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateGoal(id, {
        status: goal.status === 'paused' ? 'active' : 'paused'
      });
    }
  };

  const handleComplete = (id) => {
    if (confirm('Mark this goal as complete and move to archive?')) {
      updateGoal(id, { status: 'completed' });
      archiveGoal(id);
    }
  };

  const handleCreateGoal = (goalData) => {
    createGoal(goalData);
    setShowForm(false);
  };

  const handleUpdateGoal = (goalData) => {
    updateGoal(goalData.id, goalData);
    setShowForm(false);
    setEditingGoal(null);
    // Refresh selected goal if it's being viewed
    if (selectedGoal && selectedGoal.id === goalData.id) {
      setSelectedGoal(goals.find(g => g.id === goalData.id));
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
    setSelectedGoal(null);
  };

  const getFilteredGoals = () => {
    switch (view) {
      case 'active':
        return goals.filter(g => g.status === 'active');
      case 'paused':
        return goals.filter(g => g.status === 'paused');
      case 'archive':
        return getArchivedGoals();
      default:
        return [];
    }
  };

  const filteredGoals = getFilteredGoals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target size={32} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Goals</h1>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transition-colors"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'active'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active ({goals.filter(g => g.status === 'active').length})
          </button>
          <button
            onClick={() => setView('paused')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'paused'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Paused ({goals.filter(g => g.status === 'paused').length})
          </button>
          <button
            onClick={() => setView('archive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'archive'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Archive ({getArchivedGoals().length})
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map(goal => (
              <Goal
                key={goal.id}
                goal={goal}
                tasks={tasks}
                onClick={() => setSelectedGoal(goal)}
                onPause={handlePause}
                onComplete={handleComplete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <Target size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No {view} goals yet
              </h3>
              <p className="text-gray-500 mb-4">
                {view === 'active' && 'Create your first goal to get started!'}
                {view === 'paused' && 'No paused goals at the moment.'}
                {view === 'archive' && 'Completed and abandoned goals will appear here.'}
              </p>
              {view === 'active' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Goal
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
          onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        />
      )}

      {selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          tasks={tasks}
          onClose={() => setSelectedGoal(null)}
          onUpdate={updateGoal}
          onEdit={() => handleEditGoal(selectedGoal)}
          onDelete={view === 'archive' ? deleteArchivedGoal : deleteGoal}
          onArchive={archiveGoal}
          onToggleSubGoal={toggleSubGoalComplete}
          onAddSubGoal={addSubGoal}
          onUpdateSubGoal={updateSubGoal}
          onDeleteSubGoal={deleteSubGoal}
        />
      )}
    </div>
  );
};

export default GoalBoard;
