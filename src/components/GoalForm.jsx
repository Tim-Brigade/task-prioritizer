import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatDateForInput, getTodayString } from '../utils/dateUtils';

/**
 * Form component for creating and editing goals
 */
const GoalForm = ({ goal = null, onClose, onSubmit }) => {
  const isEditing = !!goal;

  const [type, setType] = useState(goal?.type || 'simple');
  const [title, setTitle] = useState(goal?.title || '');
  const [outcome, setOutcome] = useState(goal?.outcome || '');
  const [startDate, setStartDate] = useState(
    goal?.timeline?.start ? formatDateForInput(goal.timeline.start) : getTodayString()
  );
  const [endDate, setEndDate] = useState(
    goal?.timeline?.end ? formatDateForInput(goal.timeline.end) : ''
  );
  const [subGoals, setSubGoals] = useState(
    goal?.subGoals || []
  );

  const handleAddSubGoal = () => {
    setSubGoals([
      ...subGoals,
      {
        id: uuidv4(),
        title: '',
        targetDate: '',
        status: 'pending'
      }
    ]);
  };

  const handleUpdateSubGoal = (index, field, value) => {
    const updated = [...subGoals];
    updated[index] = { ...updated[index], [field]: value };
    setSubGoals(updated);
  };

  const handleRemoveSubGoal = (index) => {
    setSubGoals(subGoals.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    if (!outcome.trim()) {
      alert('Please describe the outcome');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please set start and end dates');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      alert('End date must be after start date');
      return;
    }

    if (type === 'major' && subGoals.length === 0) {
      alert('Major goals require at least one sub-goal');
      return;
    }

    // Validate sub-goals
    if (type === 'major') {
      const invalidSubGoals = subGoals.filter(sg => !sg.title.trim());
      if (invalidSubGoals.length > 0) {
        alert('All sub-goals must have a title');
        return;
      }
    }

    const goalData = {
      type,
      title: title.trim(),
      outcome: outcome.trim(),
      timeline: {
        start: startDate,
        end: endDate
      }
    };

    if (type === 'major') {
      goalData.subGoals = subGoals.map(sg => ({
        ...sg,
        title: sg.title.trim()
      }));
    }

    // If editing, preserve existing data
    if (isEditing) {
      onSubmit({ ...goal, ...goalData });
    } else {
      onSubmit(goalData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Goal Type</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="simple"
                  checked={type === 'simple'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                <span>Simple Goal</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="major"
                  checked={type === 'major'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                <span>Major Goal</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter goal title"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Outcome (what does "done" look like?)
            </label>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Describe what success looks like for this goal"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sub-goals (for major goals only) */}
          {type === 'major' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold">
                  Sub-goals
                </label>
                <button
                  type="button"
                  onClick={handleAddSubGoal}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Add Sub-goal
                </button>
              </div>

              <div className="space-y-2">
                {subGoals.map((subGoal, index) => (
                  <div key={subGoal.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={subGoal.title}
                        onChange={(e) =>
                          handleUpdateSubGoal(index, 'title', e.target.value)
                        }
                        placeholder="Sub-goal title"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-40">
                      <input
                        type="date"
                        value={subGoal.targetDate || ''}
                        onChange={(e) =>
                          handleUpdateSubGoal(index, 'targetDate', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubGoal(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {subGoals.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No sub-goals yet. Click "Add Sub-goal" to create one.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
