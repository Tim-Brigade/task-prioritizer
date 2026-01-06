import React, { useState, useEffect } from 'react';
import { Plus, Target, HelpCircle, X } from 'lucide-react';
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
  const [showHelpModal, setShowHelpModal] = useState(false);

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 shadow-md transition-colors"
              title="Help"
            >
              <HelpCircle size={20} />
              Help
            </button>
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">How to Use Goals</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Overview</h3>
                <p className="text-gray-700">
                  The Goals feature helps you track both simple objectives and complex projects with multiple milestones.
                  Link your daily tasks to long-term goals and get automatic progress tracking and staleness alerts.
                </p>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="text-lg font-bold text-blue-900 mb-2">✨ Why Use Goals?</h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Stay aligned:</strong> Connect daily tasks to bigger picture objectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Track progress:</strong> Visual progress bars show how close you are to completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Prevent neglect:</strong> Staleness alerts warn when goals haven't been worked on recently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Break down complexity:</strong> Major goals with sub-goals help manage multi-step projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>See what's next:</strong> Each goal displays your highest priority linked task</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">📊 Goal Types</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-400 pl-3">
                    <h4 className="font-semibold text-gray-900">Simple Goals</h4>
                    <p className="text-sm text-gray-600">Single-outcome objectives with straightforward completion criteria. Examples: "Learn to make lentil dahl," "Read 12 books this year."</p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-3">
                    <h4 className="font-semibold text-gray-900">Major Goals</h4>
                    <p className="text-sm text-gray-600">Complex projects requiring multiple milestones. Break these into sub-goals to track progress. Examples: "Launch film scanner product," "Complete home renovation."</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">🔑 Key Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Create Goals:</strong> Click "New Goal" to create either a Simple or Major goal. Set a timeline, describe the outcome, and add sub-goals for Major goals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Link Tasks:</strong> When creating or editing tasks, use the "Link to Goal" dropdown to connect tasks to goals. Linked tasks automatically update the goal's last activity date.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Track Sub-goals:</strong> For Major goals, click a goal card to open details and manage sub-goals. Check them off as you complete milestones.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Staleness Alerts:</strong> Goals show colored indicators based on time since last activity:
                      <span className="ml-1 text-green-600">✅ Fresh</span>,
                      <span className="ml-1 text-amber-600">⚠️ Warning</span>,
                      <span className="ml-1 text-red-600">🚨 Stale</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Adaptive Thresholds:</strong> Staleness thresholds automatically adjust based on goal timeline (7 days for short goals, up to 30 days for year-long goals).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Pause/Resume:</strong> Temporarily pause goals you're not actively working on without losing progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Archive:</strong> Completed and abandoned goals move to the Archive view for reference.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Progress Tracking:</strong> Major goals show percentage completion based on sub-goals. Progress bars provide quick visual feedback.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Best Practices</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    <span><strong>Define clear outcomes:</strong> Describe what "done" looks like in specific, measurable terms.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    <span><strong>Set realistic timelines:</strong> Give yourself enough time but add some healthy pressure with deadlines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    <span><strong>Break down Major goals:</strong> 3-10 sub-goals work best for tracking meaningful progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    <span><strong>Link tasks regularly:</strong> Connect your Q1 and Q2 tasks to goals to see how daily work contributes to long-term success.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    <span><strong>Review weekly:</strong> Check the Goals tab during your weekly review. Address stale goals and celebrate progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    <span><strong>Don't overload:</strong> Focus on 3-5 active goals at a time to maintain momentum.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">🔄 Views</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="font-semibold text-gray-700 w-24">Active</span>
                    <span className="text-gray-600">Goals you're currently working on</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="font-semibold text-gray-700 w-24">Paused</span>
                    <span className="text-gray-600">Goals temporarily on hold</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="font-semibold text-gray-700 w-24">Archive</span>
                    <span className="text-gray-600">Completed and abandoned goals for reference</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalBoard;
