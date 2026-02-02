import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Auto-select icon based on task title
const iconMap = [
  // Development & Tech
  { keywords: ['bug', 'fix', 'error', 'crash', 'issue', 'debug'], emoji: '🐛' },
  { keywords: ['code', 'develop', 'program', 'implement', 'build', 'refactor'], emoji: '💻' },
  { keywords: ['deploy', 'release', 'launch', 'ship', 'publish'], emoji: '🚀' },
  { keywords: ['test', 'qa', 'quality', 'testing'], emoji: '🧪' },
  { keywords: ['api', 'endpoint', 'integration', 'webhook'], emoji: '🔌' },
  { keywords: ['database', 'data', 'sql', 'query', 'schema'], emoji: '🗄️' },
  { keywords: ['server', 'backend', 'infrastructure'], emoji: '🖥️' },
  { keywords: ['frontend', 'ui', 'interface'], emoji: '🌐' },
  { keywords: ['mobile', 'app', 'ios', 'android'], emoji: '📱' },
  { keywords: ['performance', 'optimize', 'speed'], emoji: '⚡' },
  { keywords: ['security', 'password', 'auth', 'encryption'], emoji: '🔒' },
  { keywords: ['backup', 'save', 'archive', 'export'], emoji: '💾' },

  // Design & Creative
  { keywords: ['design', 'ui', 'ux', 'mockup', 'prototype'], emoji: '🎨' },
  { keywords: ['logo', 'brand', 'identity'], emoji: '🎭' },
  { keywords: ['photo', 'image', 'picture'], emoji: '📸' },
  { keywords: ['video', 'film', 'record'], emoji: '🎬' },
  { keywords: ['music', 'audio', 'sound'], emoji: '🎵' },

  // Communication
  { keywords: ['meeting', 'call', 'zoom', 'conference', 'standup'], emoji: '📞' },
  { keywords: ['email', 'message', 'reply', 'respond', 'inbox'], emoji: '📧' },
  { keywords: ['chat', 'slack', 'discord', 'teams'], emoji: '💬' },
  { keywords: ['present', 'demo', 'show', 'pitch'], emoji: '📊' },
  { keywords: ['interview', 'recruit', 'hire'], emoji: '🎤' },
  { keywords: ['feedback', 'survey', 'review'], emoji: '📝' },

  // Documentation & Content
  { keywords: ['document', 'report', 'write', 'draft', 'doc'], emoji: '📄' },
  { keywords: ['blog', 'article', 'content', 'post'], emoji: '✍️' },
  { keywords: ['note', 'memo', 'minutes'], emoji: '📋' },
  { keywords: ['contract', 'agreement', 'legal'], emoji: '📜' },

  // Planning & Management
  { keywords: ['plan', 'strategy', 'roadmap', 'planning'], emoji: '🗺️' },
  { keywords: ['goal', 'target', 'objective', 'okr'], emoji: '🎯' },
  { keywords: ['schedule', 'calendar', 'appointment'], emoji: '📅' },
  { keywords: ['deadline', 'due', 'time'], emoji: '⏰' },
  { keywords: ['todo', 'task', 'checklist'], emoji: '✅' },
  { keywords: ['prioritize', 'organize', 'sort'], emoji: '📌' },

  // Business & Finance
  { keywords: ['money', 'budget', 'finance', 'pay', 'payment', 'invoice'], emoji: '💰' },
  { keywords: ['sales', 'revenue', 'profit'], emoji: '💵' },
  { keywords: ['analytics', 'metrics', 'stats', 'kpi', 'dashboard'], emoji: '📈' },
  { keywords: ['client', 'customer', 'user', 'account'], emoji: '👤' },
  { keywords: ['tax', 'expense', 'receipt'], emoji: '🧾' },

  // Team & Collaboration
  { keywords: ['team', 'collaborate', 'group', 'together'], emoji: '👥' },
  { keywords: ['delegate', 'assign', 'handoff'], emoji: '🤝' },
  { keywords: ['onboard', 'train', 'mentor'], emoji: '🎓' },

  // Learning & Research
  { keywords: ['learn', 'study', 'research', 'read', 'course'], emoji: '📚' },
  { keywords: ['workshop', 'training', 'seminar'], emoji: '🎓' },
  { keywords: ['experiment', 'try', 'explore'], emoji: '🔬' },

  // Personal & Wellness
  { keywords: ['health', 'exercise', 'workout', 'gym', 'fitness'], emoji: '💪' },
  { keywords: ['doctor', 'medical', 'appointment', 'checkup'], emoji: '🏥' },
  { keywords: ['eat', 'lunch', 'dinner', 'meal', 'food', 'breakfast'], emoji: '🍽️' },
  { keywords: ['sleep', 'rest', 'relax'], emoji: '😴' },
  { keywords: ['meditate', 'mindful', 'zen'], emoji: '🧘' },
  { keywords: ['water', 'hydrate', 'drink'], emoji: '💧' },

  // Shopping & Errands
  { keywords: ['shop', 'buy', 'purchase', 'order', 'amazon'], emoji: '🛒' },
  { keywords: ['grocery', 'groceries', 'supermarket'], emoji: '🥕' },
  { keywords: ['gift', 'present', 'birthday'], emoji: '🎁' },
  { keywords: ['return', 'exchange', 'refund'], emoji: '↩️' },

  // Home & Lifestyle
  { keywords: ['clean', 'organize', 'tidy', 'declutter'], emoji: '🧹' },
  { keywords: ['laundry', 'wash', 'clothes'], emoji: '🧺' },
  { keywords: ['cook', 'recipe', 'kitchen'], emoji: '👨‍🍳' },
  { keywords: ['garden', 'plant', 'grow'], emoji: '🌱' },
  { keywords: ['pet', 'dog', 'cat', 'vet'], emoji: '🐾' },
  { keywords: ['car', 'vehicle', 'drive', 'maintenance'], emoji: '🚗' },

  // Travel & Events
  { keywords: ['travel', 'trip', 'vacation', 'holiday'], emoji: '✈️' },
  { keywords: ['flight', 'plane', 'airport'], emoji: '🛫' },
  { keywords: ['hotel', 'booking', 'reservation'], emoji: '🏨' },
  { keywords: ['event', 'conference', 'summit'], emoji: '🎪' },

  // Urgent & Important
  { keywords: ['urgent', 'critical', 'emergency', 'asap', 'important'], emoji: '🚨' },
  { keywords: ['fire', 'crisis', 'alert'], emoji: '🔥' },
  { keywords: ['warning', 'caution', 'attention'], emoji: '⚠️' },

  // Positive & Achievement
  { keywords: ['celebrate', 'party', 'success', 'win', 'achievement'], emoji: '🎉' },
  { keywords: ['complete', 'done', 'finish', 'accomplish'], emoji: '✨' },
  { keywords: ['launch', 'premiere', 'debut'], emoji: '🎊' },
  { keywords: ['milestone', 'achievement', 'badge'], emoji: '🏆' },

  // Miscellaneous
  { keywords: ['idea', 'brainstorm', 'creative', 'innovation'], emoji: '💡' },
  { keywords: ['question', 'help', 'support'], emoji: '❓' },
  { keywords: ['phone', 'mobile', 'call'], emoji: '☎️' },
  { keywords: ['print', 'printer', 'copy'], emoji: '🖨️' },
  { keywords: ['scan', 'scanner'], emoji: '📠' },
  { keywords: ['book', 'library', 'novel'], emoji: '📖' },
  { keywords: ['news', 'article', 'update'], emoji: '📰' },
  { keywords: ['weather', 'forecast', 'climate'], emoji: '🌤️' },
  { keywords: ['repair', 'maintenance', 'service'], emoji: '🔧' },
  { keywords: ['renew', 'renewal', 'subscription'], emoji: '🔄' },
];

/**
 * Get auto-suggested icon based on task title
 * @param {string} title - task title
 * @returns {string} - emoji icon
 */
export const getAutoIcon = (title) => {
  const lowerTitle = title.toLowerCase();

  for (const { keywords, emoji } of iconMap) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return emoji;
    }
  }

  return '📝'; // Default icon
};

/**
 * Example tasks for first-time users
 */
const getExampleTasks = () => [
  {
    id: Date.now() + 1,
    title: 'Fix critical bug in production',
    description: 'Server crashes affecting users',
    quadrant: 'q1',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '🐛'
  },
  {
    id: Date.now() + 2,
    title: 'Learn new programming framework',
    description: 'Invest in professional development',
    quadrant: 'q2',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '📚'
  },
  {
    id: Date.now() + 3,
    title: 'Plan next quarter strategy',
    description: 'Set goals and roadmap',
    quadrant: 'q2',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '🗺️'
  },
  {
    id: Date.now() + 4,
    title: 'Respond to non-urgent emails',
    description: 'Quick replies needed',
    quadrant: 'q3',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '📧'
  },
  {
    id: Date.now() + 5,
    title: 'Attend optional meeting',
    description: 'Could be handled via email',
    quadrant: 'q3',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '📞'
  },
  {
    id: Date.now() + 6,
    title: 'Browse social media',
    description: 'Time-waster - consider eliminating',
    quadrant: 'q4',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '📱'
  },
  {
    id: Date.now() + 7,
    title: 'Exercise and meal prep',
    description: 'Important for long-term health',
    quadrant: 'q2',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '💪'
  },
  {
    id: Date.now() + 8,
    title: 'Client presentation tomorrow',
    description: 'Final preparations needed',
    quadrant: 'q1',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
    icon: '📊'
  }
];

/**
 * Custom hook for managing tasks
 * @param {object} options - configuration options
 * @returns {object} - tasks state and functions
 */
export const useTasks = (options = {}) => {
  const { onHistorySave } = options;

  // Check if first time user (no tasks in localStorage)
  const isFirstTime = !localStorage.getItem('taskPrioritizerTasks');

  const [tasks, setTasks] = useLocalStorage(
    'taskPrioritizerTasks',
    isFirstTime ? getExampleTasks() : []
  );

  // Ref for drag state to avoid re-renders
  const isDraggingRef = useRef(false);

  /**
   * Check if a due date is overdue
   */
  const isOverdue = useCallback((dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }, []);

  /**
   * Format due date for display
   */
  const formatDueDate = useCallback((dueDate) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  /**
   * Add a new task
   */
  const addTask = useCallback((taskData) => {
    const task = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description || '',
      quadrant: taskData.quadrant || 'q2',
      dueDate: taskData.dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
      icon: taskData.icon || getAutoIcon(taskData.title),
      delegate: taskData.delegate || '',
      goalId: taskData.goalId || null
    };

    setTasks(prev => [...prev, task]);
    return task;
  }, [setTasks]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback((taskId, updates) => {
    let oldTask = null;

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        oldTask = { ...task };
        return { ...task, ...updates };
      }
      return task;
    }));

    if (oldTask && onHistorySave) {
      onHistorySave('edit', oldTask);
    }

    return oldTask;
  }, [setTasks, onHistorySave]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);

    if (task && onHistorySave) {
      onHistorySave('delete', { ...task });
    }

    setTasks(prev => prev.filter(t => t.id !== taskId));
    return task;
  }, [tasks, setTasks, onHistorySave]);

  /**
   * Toggle task completion
   */
  const toggleComplete = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);

    if (task && onHistorySave) {
      onHistorySave('complete', { ...task });
    }

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));

    return task;
  }, [tasks, setTasks, onHistorySave]);

  /**
   * Move task to a different quadrant
   */
  const moveTask = useCallback((taskId, newQuadrant) => {
    const task = tasks.find(t => t.id === taskId);

    if (task && task.quadrant !== newQuadrant) {
      if (onHistorySave) {
        onHistorySave('move', { ...task });
      }

      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, quadrant: newQuadrant } : t
      ));
    }

    return task;
  }, [tasks, setTasks, onHistorySave]);

  /**
   * Get tasks filtered by quadrant with sorting
   */
  const getQuadrantTasks = useCallback((quadrant, hideCompleted = false) => {
    return tasks
      .filter(t => t.quadrant === quadrant)
      .filter(t => !hideCompleted || !t.completed)
      .sort((a, b) => {
        // Sort by: 1) not completed first, 2) has due date, 3) due date ascending
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }

        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;

        return 0;
      });
  }, [tasks]);

  /**
   * Get completed tasks
   */
  const getCompletedTasks = useCallback(() => {
    return tasks.filter(t => t.completed);
  }, [tasks]);

  /**
   * Clear completed tasks
   */
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(t => !t.completed));
  }, [setTasks]);

  /**
   * Auto-promote tasks to urgent when due date is approaching
   */
  useEffect(() => {
    if (isDraggingRef.current) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksToUpdate = tasks.filter(task => {
      if (task.completed || !task.dueDate || (task.quadrant !== 'q2' && task.quadrant !== 'q4')) {
        return false;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays < 1;
    });

    if (tasksToUpdate.length > 0) {
      setTasks(prevTasks => prevTasks.map(task => {
        const shouldUpdate = tasksToUpdate.find(t => t.id === task.id);
        if (shouldUpdate) {
          const newQuadrant = task.quadrant === 'q2' ? 'q1' : 'q3';
          return { ...task, quadrant: newQuadrant };
        }
        return task;
      }));
    }
  }, [tasks, setTasks]);

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    moveTask,
    getQuadrantTasks,
    getCompletedTasks,
    clearCompletedTasks,
    isOverdue,
    formatDueDate,
    isDraggingRef
  };
};
