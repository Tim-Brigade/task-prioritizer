import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { getAutoIcon } from '../hooks/useTasks';

/**
 * Modal for adding or editing tasks
 */
const TaskModal = ({
  isOpen,
  mode = 'add', // 'add' or 'edit'
  task = null,
  selectedQuadrant = null,
  goals = [],
  onSave,
  onClose
}) => {
  const defaultTask = {
    title: '',
    description: '',
    quadrant: selectedQuadrant || 'q2',
    dueDate: '',
    icon: '📝',
    delegate: '',
    goalId: null
  };

  const [formData, setFormData] = useState(defaultTask);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setFormData({
          ...task,
          icon: task.icon || getAutoIcon(task.title)
        });
      } else {
        setFormData({
          ...defaultTask,
          quadrant: selectedQuadrant || 'q2'
        });
      }
      setShowEmojiPicker(false);
    }
  }, [isOpen, mode, task, selectedQuadrant]);

  if (!isOpen) return null;

  const handleTitleChange = (title) => {
    setFormData({
      ...formData,
      title,
      icon: getAutoIcon(title)
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    setShowEmojiPicker(false);
    onClose();
  };

  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Task' : 'Add Task'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
          {/* Icon selector */}
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-2xl px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex-shrink-0"
                title="Click to change icon"
              >
                {formData.icon || '📝'}
              </button>
              <span className="text-xs text-gray-500">Click to change</span>
            </div>
            {showEmojiPicker && (
              <div className="mt-2 relative z-10">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setFormData({ ...formData, icon: emojiData.emoji });
                    setShowEmojiPicker(false);
                  }}
                  width="100%"
                  height={350}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="Add details... (use * for bullet points)"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quadrant */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Quadrant
            </label>
            <select
              value={formData.quadrant}
              onChange={(e) => setFormData({ ...formData, quadrant: e.target.value })}
              disabled={mode === 'add' && selectedQuadrant !== null}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="q1">Q1: Urgent & Important</option>
              <option value="q2">Q2: Important, Not Urgent</option>
              <option value="q3">Q3: Urgent, Not Important</option>
              <option value="q4">Q4: Neither</option>
            </select>
          </div>

          {/* Delegate (Q3 only) */}
          {formData.quadrant === 'q3' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Delegate To (Optional)
              </label>
              <input
                type="text"
                value={formData.delegate || ''}
                onChange={(e) => setFormData({ ...formData, delegate: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Name of person to delegate to"
              />
            </div>
          )}

          {/* Goal Link */}
          {activeGoals.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Link to Goal (Optional)
              </label>
              <select
                value={formData.goalId || ''}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value || null })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No goal</option>
                {activeGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition-colors"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add Task'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 text-sm rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
