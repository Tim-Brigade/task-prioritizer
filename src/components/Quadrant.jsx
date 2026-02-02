import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import TaskCard from './TaskCard';

/**
 * Quadrant configuration
 */
export const quadrantConfig = {
  q1: {
    title: 'Urgent & Important',
    subtitle: 'Do First',
    color: '#FFCCCC',
    darkColor: '#FF6B6B'
  },
  q2: {
    title: 'Important, Not Urgent',
    subtitle: 'Schedule',
    color: '#CCE5FF',
    darkColor: '#4A90E2'
  },
  q3: {
    title: 'Urgent, Not Important',
    subtitle: 'Delegate',
    color: '#FFFFCC',
    darkColor: '#F4D03F'
  },
  q4: {
    title: 'Neither Urgent nor Important',
    subtitle: 'Eliminate/Communicate',
    color: '#E0E0E0',
    darkColor: '#9E9E9E'
  }
};

/**
 * Q1 overload threshold
 */
export const Q1_OVERLOAD_THRESHOLD = 6;

/**
 * Quadrant component for the Eisenhower Matrix
 */
const Quadrant = ({
  quadrant,
  tasks = [],
  allTasks = [],
  isDropTarget = false,
  isDragging = false,
  fontFamily = "'Indie Flower', cursive",
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onShowOverloadWarning,
  isOverdue,
  formatDueDate
}) => {
  const config = quadrantConfig[quadrant];
  const q1Tasks = allTasks.filter(t => t.quadrant === 'q1' && !t.completed);
  const isQ1Overloaded = quadrant === 'q1' && q1Tasks.length >= Q1_OVERLOAD_THRESHOLD;

  // Get incomplete tasks for priority calculation
  const incompleteTasks = tasks.filter(t => !t.completed);

  return (
    <div
      className={`relative p-4 flex flex-col transition-all ${
        isDragging ? 'ring-2 ring-transparent' : ''
      } ${isDropTarget ? 'ring-4 ring-blue-400 ring-opacity-50 bg-blue-50 bg-opacity-30' : ''}`}
      onDragOver={(e) => onDragOver?.(e, quadrant)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, quadrant)}
    >
      {/* Header */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`bg-white bg-opacity-80 backdrop-blur-sm px-3 py-1.5 rounded shadow-md transition-all ${
          isDropTarget ? 'ring-2 ring-blue-400 scale-105' : ''
        } ${isQ1Overloaded ? 'ring-2 ring-orange-500' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-800">{config.title}</div>
              <div className="text-xs text-gray-600">{config.subtitle}</div>
            </div>
            {isQ1Overloaded && (
              <button
                onClick={onShowOverloadWarning}
                className="text-orange-600 hover:text-orange-700 transition-colors"
                title="Q1 overload warning - click for tips"
              >
                <AlertTriangle size={16} className="animate-pulse" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddTask?.(quadrant)}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10"
        title="Add task"
      >
        <Plus size={18} className="text-gray-700" />
      </button>

      {/* Tasks grid */}
      <div className="mt-16 grid grid-cols-2 gap-4 auto-rows-min">
        {tasks.map(task => {
          const taskIndex = incompleteTasks.findIndex(t => t.id === task.id);
          const isTopPriority = quadrant === 'q1' && !task.completed && taskIndex >= 0 && taskIndex < 3;

          return (
            <TaskCard
              key={task.id}
              task={task}
              config={config}
              isTopPriority={isTopPriority}
              priorityIndex={taskIndex}
              fontFamily={fontFamily}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isOverdue={isOverdue}
              formatDueDate={formatDueDate}
            />
          );
        })}
      </div>

      {/* Drop indicator */}
      {isDropTarget && (
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-blue-400 rounded-lg bg-blue-100 bg-opacity-10 flex items-center justify-center">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium">
            Drop here
          </div>
        </div>
      )}
    </div>
  );
};

export default Quadrant;
