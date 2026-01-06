import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatDateForDisplay, formatDateForInput } from '../utils/dateUtils';

/**
 * Component for displaying and managing sub-goals within a major goal
 */
const SubGoalList = ({ goal, onToggle, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSubGoal, setNewSubGoal] = useState({ title: '', targetDate: '' });
  const [editData, setEditData] = useState({ title: '', targetDate: '' });

  const handleAdd = () => {
    if (!newSubGoal.title.trim()) {
      alert('Please enter a sub-goal title');
      return;
    }
    onAdd(goal.id, newSubGoal);
    setNewSubGoal({ title: '', targetDate: '' });
    setIsAdding(false);
  };

  const handleUpdate = (subGoalId) => {
    if (!editData.title.trim()) {
      alert('Please enter a sub-goal title');
      return;
    }
    onUpdate(goal.id, subGoalId, editData);
    setEditingId(null);
    setEditData({ title: '', targetDate: '' });
  };

  const startEditing = (subGoal) => {
    setEditingId(subGoal.id);
    setEditData({
      title: subGoal.title,
      targetDate: subGoal.targetDate || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ title: '', targetDate: '' });
  };

  const subGoals = goal.subGoals || [];
  const completedCount = subGoals.filter(sg => sg.status === 'complete').length;
  const totalCount = subGoals.length;

  return (
    <div className="space-y-3">
      {/* Progress Summary */}
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-700">
          Sub-goals ({completedCount} / {totalCount} complete)
        </h4>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          Add Sub-goal
        </button>
      </div>

      {/* Sub-goals List */}
      <div className="space-y-2">
        {subGoals.map((subGoal) => (
          <div key={subGoal.id}>
            {editingId === subGoal.id ? (
              // Edit mode
              <div className="flex gap-2 items-start bg-gray-50 p-2 rounded">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Sub-goal title"
                  />
                  <input
                    type="date"
                    value={editData.targetDate ? formatDateForInput(editData.targetDate) : ''}
                    onChange={(e) => setEditData({ ...editData, targetDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleUpdate(subGoal.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-gray-600 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded group">
                <button
                  onClick={() => onToggle(goal.id, subGoal.id)}
                  className="mt-1 text-gray-600 hover:text-green-600"
                >
                  {subGoal.status === 'complete' ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${subGoal.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {subGoal.title}
                  </p>
                  {subGoal.targetDate && (
                    <p className="text-xs text-gray-500">
                      Target: {formatDateForDisplay(subGoal.targetDate)}
                    </p>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={() => startEditing(subGoal)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this sub-goal?')) {
                        onDelete(goal.id, subGoal.id);
                      }
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add New Sub-goal Form */}
        {isAdding && (
          <div className="flex gap-2 items-start bg-blue-50 p-2 rounded">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={newSubGoal.title}
                onChange={(e) => setNewSubGoal({ ...newSubGoal, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="New sub-goal title"
                autoFocus
              />
              <input
                type="date"
                value={newSubGoal.targetDate}
                onChange={(e) => setNewSubGoal({ ...newSubGoal, targetDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleAdd}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <CheckCircle2 size={18} />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewSubGoal({ title: '', targetDate: '' });
                }}
                className="p-1 text-gray-600 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {subGoals.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 italic">
          No sub-goals yet. Click "Add Sub-goal" to create one.
        </p>
      )}
    </div>
  );
};

export default SubGoalList;
