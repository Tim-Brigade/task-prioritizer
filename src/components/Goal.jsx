import React from 'react';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getStalenessLevel, calculateProgress, getStalenessText } from '../utils/goalUtils';
import { formatDateForDisplay } from '../utils/dateUtils';

/**
 * Goal card component for displaying a goal in list view
 */
const Goal = ({ goal, tasks = [], onClick, onPause, onComplete }) => {
  const stalenessLevel = getStalenessLevel(goal);
  const progress = calculateProgress(goal);

  const getStalenessIcon = () => {
    switch (stalenessLevel) {
      case 'stale':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-amber-500" size={16} />;
      case 'fresh':
        return <CheckCircle2 className="text-green-500" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getNextAction = () => {
    if (!goal.linkedTasks || goal.linkedTasks.length === 0) {
      return 'No tasks linked';
    }

    const linkedTasks = tasks.filter(t =>
      goal.linkedTasks.includes(t.id) && !t.completed
    );

    if (linkedTasks.length === 0) {
      return 'All tasks completed';
    }

    return linkedTasks[0].title || 'View linked tasks';
  };

  return (
    <div
      className="bg-yellow-100 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow border-2 border-yellow-200"
      onClick={onClick}
      style={{ fontFamily: "'Indie Flower', cursive" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg flex-1 pr-2">{goal.title}</h3>
        {goal.type === 'major' && (
          <span className="text-sm font-semibold bg-yellow-200 px-2 py-1 rounded">
            {progress}%
          </span>
        )}
      </div>

      {/* Timeline and Staleness */}
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>
            {formatDateForDisplay(goal.timeline.start)} - {formatDateForDisplay(goal.timeline.end)}
          </span>
        </div>
        {stalenessLevel !== 'never' && (
          <div className="flex items-center gap-1 ml-auto">
            {getStalenessIcon()}
            <span className="text-xs">{getStalenessText(goal)}</span>
          </div>
        )}
      </div>

      {/* Progress bar for major goals */}
      {goal.type === 'major' && (
        <div className="mb-2">
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Next Action */}
      <div className="text-sm text-gray-700 italic mb-3">
        Next: {getNextAction()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPause(goal.id);
          }}
          className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          {goal.status === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(goal.id);
          }}
          className="text-xs px-3 py-1 bg-green-200 rounded hover:bg-green-300 transition-colors"
        >
          ✓ Complete
        </button>
      </div>
    </div>
  );
};

export default Goal;
