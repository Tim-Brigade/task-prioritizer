import React, { useState } from 'react';
import { X, Edit2, Trash2, Pause, Play, CheckCircle } from 'lucide-react';
import SubGoalList from './SubGoalList';
import { calculateProgress, getStalenessText, getStalenessLevel } from '../utils/goalUtils';
import { formatDateForDisplay } from '../utils/dateUtils';

const LIFE_AREA_LABELS = {
  'career': 'Career',
  'health': 'Health & Fitness',
  'relationships': 'Relationships',
  'finance': 'Finance',
  'personal-growth': 'Personal Growth',
  'education': 'Education',
  'hobbies': 'Hobbies & Recreation',
  'other': 'Other'
};

/**
 * Modal component for displaying detailed goal information
 */
const GoalDetail = ({ goal, tasks = [], onClose, onUpdate, onEdit, onDelete, onArchive, onToggleSubGoal, onAddSubGoal, onUpdateSubGoal, onDeleteSubGoal }) => {
  const progress = calculateProgress(goal);
  const stalenessLevel = getStalenessLevel(goal);

  // Find linked tasks
  const linkedTasks = tasks.filter(t => goal.linkedTasks?.includes(t.id));
  const incompleteTasks = linkedTasks.filter(t => !t.completed);

  const handlePause = () => {
    onUpdate(goal.id, {
      status: goal.status === 'paused' ? 'active' : 'paused'
    });
  };

  const handleComplete = () => {
    if (confirm('Mark this goal as complete and move it to archive?')) {
      onUpdate(goal.id, { status: 'completed' });
      onArchive(goal.id);
      onClose();
    }
  };

  const handleAbandon = () => {
    if (confirm('Abandon this goal and move it to archive?')) {
      onUpdate(goal.id, { status: 'abandoned' });
      onArchive(goal.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm('Permanently delete this goal? This cannot be undone.')) {
      onDelete(goal.id);
      onClose();
    }
  };

  const getStalenessColor = () => {
    switch (stalenessLevel) {
      case 'stale': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'fresh': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{goal.title}</h2>
              {goal.type === 'major' && (
                <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Major Goal
                </span>
              )}
              {goal.lifeArea && LIFE_AREA_LABELS[goal.lifeArea] && (
                <span className="text-sm font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {LIFE_AREA_LABELS[goal.lifeArea]}
                </span>
              )}
              {goal.status === 'paused' && (
                <span className="text-sm font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  Paused
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timeline and Status */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Timeline:</span>{' '}
              {formatDateForDisplay(goal.timeline.start)} - {formatDateForDisplay(goal.timeline.end)}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span className="capitalize">{goal.status}</span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Last Activity:</span>{' '}
              <span className={getStalenessColor()}>
                {getStalenessText(goal)}
              </span>
            </div>
          </div>

          {/* Outcome */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Outcome</h3>
            <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {goal.outcome}
            </p>
          </div>

          {/* S.M.A.R.T. Details */}
          {(goal.why || goal.resources || goal.obstacles) && (
            <div className="space-y-4">
              {goal.why && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Why This Matters</h3>
                  <p className="text-gray-800 whitespace-pre-wrap bg-purple-50 p-3 rounded">
                    {goal.why}
                  </p>
                </div>
              )}
              {goal.resources && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Resources Needed</h3>
                  <p className="text-gray-800 whitespace-pre-wrap bg-green-50 p-3 rounded">
                    {goal.resources}
                  </p>
                </div>
              )}
              {goal.obstacles && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Potential Obstacles</h3>
                  <p className="text-gray-800 whitespace-pre-wrap bg-amber-50 p-3 rounded">
                    {goal.obstacles}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Progress (for major goals) */}
          {goal.type === 'major' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Progress: {goal.subGoals?.filter(sg => sg.status === 'complete').length || 0} of {goal.subGoals?.length || 0} sub-goals complete ({progress}%)
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 10 && (
                    <span className="text-xs text-white font-semibold">{progress}%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub-goals (for major goals) */}
          {goal.type === 'major' && (
            <div>
              <SubGoalList
                goal={goal}
                onToggle={onToggleSubGoal}
                onAdd={onAddSubGoal}
                onUpdate={onUpdateSubGoal}
                onDelete={onDeleteSubGoal}
              />
            </div>
          )}

          {/* Linked Tasks */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">
              Linked Tasks ({linkedTasks.length})
            </h3>
            {linkedTasks.length > 0 ? (
              <div className="space-y-2">
                {linkedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-2 rounded border ${
                      task.completed
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{task.icon || '📝'}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      {task.completed && (
                        <CheckCircle className="text-green-600" size={16} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No tasks linked to this goal yet. Link tasks from the task board.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Edit2 size={16} />
              Edit Goal
            </button>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {goal.status === 'paused' ? (
                <>
                  <Play size={16} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={16} />
                  Pause
                </>
              )}
            </button>
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              <CheckCircle size={16} />
              Complete
            </button>
            <button
              onClick={handleAbandon}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
            >
              Abandon
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ml-auto"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetail;
