import React from 'react';
import { Check, Edit2, X, Calendar } from 'lucide-react';

/**
 * Render description with bullet point and numbered list support
 */
const renderDescription = (description, fontFamily) => {
  const lines = description.split('\n');
  const hasBullets = lines.some(line => line.trim().startsWith('*'));
  const hasNumberedList = lines.some(line => /^\s*\d+\./.test(line));

  if (!hasBullets && !hasNumberedList) {
    return <div className="whitespace-pre-wrap">{description}</div>;
  }

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('*')) {
          return (
            <div key={idx} className="flex gap-2 ml-2">
              <span className="flex-shrink-0">•</span>
              <span>{trimmed.substring(1).trim()}</span>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex gap-2 ml-2">
              <span className="flex-shrink-0">{numberedMatch[1]}.</span>
              <span>{numberedMatch[2]}</span>
            </div>
          );
        }

        if (trimmed === '') {
          return null;
        }

        return <div key={idx} className="whitespace-pre-wrap">{line}</div>;
      })}
    </div>
  );
};

/**
 * Post-it note style task card component
 */
const TaskCard = ({
  task,
  config,
  isTopPriority = false,
  priorityIndex = 0,
  fontFamily = "'Indie Flower', cursive",
  onToggleComplete,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  isOverdue,
  formatDueDate
}) => {
  const rotate = (task.id % 6) - 3;

  const handleDragStartWrapper = (e) => {
    const target = e.target;
    if (target.closest('button') || target.tagName === 'BUTTON') {
      e.preventDefault();
      return;
    }
    onDragStart?.(e, task);
  };

  const handleDoubleClick = (e) => {
    const target = e.target;
    if (target.closest('button') || target.tagName === 'BUTTON') {
      return;
    }
    onEdit?.(task);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStartWrapper}
      onDragEnd={onDragEnd}
      onDoubleClick={handleDoubleClick}
      className={`relative transition-all cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-xl ${
        task.completed ? 'opacity-60' : ''
      } ${isTopPriority ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        backgroundColor: config.color,
        boxShadow: isTopPriority ? '6px 6px 12px rgba(239, 68, 68, 0.3)' : '4px 4px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div className="p-3 min-h-[120px] flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleComplete?.(task.id)}
              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-600 hover:border-green-600 bg-white bg-opacity-50'
              }`}
            >
              {task.completed && <Check size={12} className="text-white" />}
            </button>
            <div className="relative">
              <span className="text-xl" title="Task icon">{task.icon || '📝'}</span>
              {isTopPriority && (
                <span
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center"
                  title={`Top priority #${priorityIndex + 1}`}
                >
                  {priorityIndex + 1}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit?.(task)}
              className="text-gray-600 hover:text-blue-700 transition-colors"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete?.(task.id)}
              className="text-gray-600 hover:text-red-700 transition-colors"
              title="Delete"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div
            className={`font-handwriting text-sm font-medium text-gray-900 break-words mb-1 ${
              task.completed ? 'line-through' : ''
            }`}
            style={{ fontFamily }}
          >
            {task.title}
          </div>
          {task.description && (
            <div
              className={`text-xs text-gray-700 ${
                task.completed ? 'line-through' : ''
              }`}
              style={{ fontFamily }}
            >
              {renderDescription(task.description, fontFamily)}
            </div>
          )}
        </div>

        {task.dueDate && (
          <div className={`text-xs mt-2 flex items-center gap-1 ${
            task.completed
              ? 'text-gray-500 line-through'
              : isOverdue?.(task.dueDate)
              ? 'text-red-700 font-bold'
              : 'text-gray-700'
          }`}>
            <Calendar size={10} />
            <span style={{ fontFamily }}>
              {formatDueDate?.(task.dueDate)}
            </span>
          </div>
        )}

        {task.quadrant === 'q3' && task.delegate && (
          <div
            className={`text-xs mt-2 px-2 py-1 bg-yellow-100 rounded text-yellow-900 ${
              task.completed ? 'line-through text-yellow-700' : ''
            }`}
            style={{ fontFamily }}
          >
            Delegated to: {task.delegate}
          </div>
        )}
      </div>

      {/* Tape effect */}
      <div
        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-white bg-opacity-40"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
      />
    </div>
  );
};

export default TaskCard;
