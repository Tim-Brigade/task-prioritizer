import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Download, Upload, HelpCircle, Heart, Type, Eye, EyeOff, MoreVertical, RotateCcw, RotateCw, Target, CheckSquare, X, Plus } from 'lucide-react';
import GoalBoard from './components/GoalBoard';
import Quadrant, { quadrantConfig, Q1_OVERLOAD_THRESHOLD } from './components/Quadrant';
import TaskModal from './components/TaskModal';
import { HelpModal, Q1OverloadModal } from './components/HelpModal';
import { getAutoIcon } from './hooks/useTasks';

// Helper to get initial tasks from localStorage
const getInitialTasks = () => {
  try {
    const savedTasks = localStorage.getItem('taskPrioritizerTasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
  }
  // Return example tasks for first-time users
  return [
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
};

const TaskPrioritizer = () => {
  const [tasks, setTasks] = useState(getInitialTasks);
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEndWeekModal, setShowEndWeekModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState(null);
  const [endWeekMessage, setEndWeekMessage] = useState('');
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [restoreMessage, setRestoreMessage] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState(null);
  const [weekStart, setWeekStart] = useState('');
  const [shoutouts, setShoutouts] = useState([]);
  const [showShoutoutModal, setShowShoutoutModal] = useState(false);
  const [newShoutout, setNewShoutout] = useState({ colleague: '', note: '' });
  const [taskFont, setTaskFont] = useState('Indie Flower');
  const [urgentImportantFont, setUrgentImportantFont] = useState('');
  const [showQ1OverloadModal, setShowQ1OverloadModal] = useState(false);
  const [hasSeenQ1Warning, setHasSeenQ1Warning] = useState(false);
  const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateTaskId, setDelegateTaskId] = useState(null);
  const [delegateName, setDelegateName] = useState('');

  // Use ref for drag state to avoid re-renders during drag
  const draggedTaskRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Undo/Redo history
  const [undoHistory, setUndoHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  // Available fonts
  const availableFonts = [
    { name: 'Indie Flower', family: "'Indie Flower', cursive" },
    { name: 'Caveat', family: "'Caveat', cursive" },
    { name: 'Patrick Hand', family: "'Patrick Hand', cursive" },
    { name: 'Architects Daughter', family: "'Architects Daughter', cursive" },
    { name: 'Helvetica', family: "Helvetica, Arial, sans-serif" },
    { name: 'Roboto', family: "'Roboto', sans-serif" },
    { name: 'Open Sans', family: "'Open Sans', sans-serif" },
    { name: 'Courier Prime', family: "'Courier Prime', monospace" },
    { name: 'Merriweather', family: "'Merriweather', serif" },
  ];

  useEffect(() => {
    const savedWeekStart = localStorage.getItem('taskPrioritizerWeekStart');
    const savedHistory = localStorage.getItem('taskPrioritizerHistory');
    const savedShoutouts = localStorage.getItem('taskPrioritizerShoutouts');
    const hasSeenHelp = localStorage.getItem('taskPrioritizerHasSeenHelp');
    const savedTaskFont = localStorage.getItem('taskPrioritizerTaskFont');
    const savedUrgentImportantFont = localStorage.getItem('taskPrioritizerUrgentImportantFont');
    const savedHideCompletedTasks = localStorage.getItem('taskPrioritizerHideCompletedTasks');
    const savedGoals = localStorage.getItem('goals');

    // Show help modal for first-time users
    if (!hasSeenHelp) {
      setShowHelpModal(true);
      localStorage.setItem('taskPrioritizerHasSeenHelp', 'true');
    }

    if (savedHistory) {
      setWeeklyHistory(JSON.parse(savedHistory));
    }

    if (savedShoutouts) {
      setShoutouts(JSON.parse(savedShoutouts));
    }

    if (savedTaskFont) {
      setTaskFont(savedTaskFont);
    }

    if (savedUrgentImportantFont) {
      setUrgentImportantFont(savedUrgentImportantFont);
    }

    if (savedHideCompletedTasks) {
      setHideCompletedTasks(savedHideCompletedTasks === 'true');
    }

    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Failed to parse goals:', error);
        setGoals([]);
      }
    }

    if (savedWeekStart) {
      setWeekStart(savedWeekStart);
    } else {
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const weekStartStr = monday.toISOString().split('T')[0];
      setWeekStart(weekStartStr);
      localStorage.setItem('taskPrioritizerWeekStart', weekStartStr);
    }

    // Load all Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Indie+Flower&family=Caveat:wght@400;700&family=Patrick+Hand&family=Architects+Daughter&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Courier+Prime:wght@400;700&family=Merriweather:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('taskPrioritizerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskPrioritizerShoutouts', JSON.stringify(shoutouts));
  }, [shoutouts]);

  useEffect(() => {
    localStorage.setItem('taskPrioritizerTaskFont', taskFont);
  }, [taskFont]);

  useEffect(() => {
    localStorage.setItem('taskPrioritizerUrgentImportantFont', urgentImportantFont);
  }, [urgentImportantFont]);

  useEffect(() => {
    localStorage.setItem('taskPrioritizerHideCompletedTasks', hideCompletedTasks.toString());
  }, [hideCompletedTasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMoreDropdown && !e.target.closest('.more-dropdown-container')) {
        setShowMoreDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreDropdown]);

  // Keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle undo/redo if modals are open
      if (showAddModal || showEditModal || showEndWeekModal || showHistoryModal || showDeleteHistoryModal || showBackupModal || showShoutoutModal || showHelpModal || showFontModal || showQ1OverloadModal || showDelegateModal) {
        return;
      }

      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Check for Ctrl+Shift+Z or Ctrl+Y - Redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoHistory, redoHistory, tasks, shoutouts, showAddModal, showEditModal, showEndWeekModal, showHistoryModal, showDeleteHistoryModal, showBackupModal, showShoutoutModal, showHelpModal, showFontModal, showQ1OverloadModal, showDelegateModal]);

  const saveToHistory = (action, data) => {
    setUndoHistory(prev => [...prev, { action, data, timestamp: Date.now() }].slice(-20)); // Keep last 20 actions
    setRedoHistory([]); // Clear redo history when new action is performed
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;

    const lastAction = undoHistory[undoHistory.length - 1];

    switch (lastAction.action) {
      case 'delete':
        // Restore deleted task
        setTasks(prevTasks => [...prevTasks, lastAction.data]);
        break;
      case 'complete':
        // Toggle completion back
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === lastAction.data.id ? lastAction.data : task
        ));
        break;
      case 'edit':
        // Restore old task state
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === lastAction.data.id ? lastAction.data : task
        ));
        break;
      case 'move':
        // Restore task to old quadrant
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === lastAction.data.id ? lastAction.data : task
        ));
        break;
      case 'deleteShoutout':
        // Restore deleted shoutout
        setShoutouts(prevShoutouts => [...prevShoutouts, lastAction.data]);
        break;
      default:
        break;
    }

    // Move action to redo history
    setRedoHistory(prev => [...prev, lastAction]);
    setUndoHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;

    const lastRedoAction = redoHistory[redoHistory.length - 1];

    switch (lastRedoAction.action) {
      case 'delete':
        // Delete task again
        setTasks(prevTasks => prevTasks.filter(task => task.id !== lastRedoAction.data.id));
        break;
      case 'complete':
        // Toggle completion again
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === lastRedoAction.data.id ? lastRedoAction.data : task
        ));
        break;
      case 'edit':
        // Reapply edit
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === lastRedoAction.data.id ? lastRedoAction.data : task
        ));
        break;
      case 'move':
        // Reapply move
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === lastRedoAction.data.id ? lastRedoAction.data : task
        ));
        break;
      case 'deleteShoutout':
        // Delete shoutout again
        setShoutouts(prevShoutouts => prevShoutouts.filter(shoutout => shoutout.id !== lastRedoAction.data.id));
        break;
      default:
        break;
    }

    // Move action back to undo history
    setUndoHistory(prev => [...prev, lastRedoAction]);
    setRedoHistory(prev => prev.slice(0, -1));
  };

  // Auto-promote tasks to urgent side when due date is less than 1 day
  useEffect(() => {
    // Skip if currently dragging to avoid conflicts
    if (isDraggingRef.current) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksToUpdate = tasks.filter(task => {
      // Only check incomplete tasks with due dates in non-urgent quadrants (q2, q4)
      if (task.completed || !task.dueDate || (task.quadrant !== 'q2' && task.quadrant !== 'q4')) {
        return false;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Promote if due date is less than 1 day away (includes today and overdue)
      return diffDays < 1;
    });

    if (tasksToUpdate.length > 0) {
      setTasks(prevTasks => prevTasks.map(task => {
        const shouldUpdate = tasksToUpdate.find(t => t.id === task.id);
        if (shouldUpdate) {
          // Move Q2 -> Q1 (keep important), Q4 -> Q3 (keep not important)
          const newQuadrant = task.quadrant === 'q2' ? 'q1' : 'q3';
          return { ...task, quadrant: newQuadrant };
        }
        return task;
      }));
    }
  }, [tasks]);

  // Monitor Q1 tasks for overload
  useEffect(() => {
    const q1Tasks = tasks.filter(t => t.quadrant === 'q1' && !t.completed);

    // Show warning if Q1 is overloaded and user hasn't seen it this session
    if (q1Tasks.length >= Q1_OVERLOAD_THRESHOLD && !hasSeenQ1Warning) {
      setShowQ1OverloadModal(true);
      setHasSeenQ1Warning(true);
    }
  }, [tasks, hasSeenQ1Warning]);

  // Calculate ISO 8601 week number (weeks start on Monday, first week contains Jan 4)
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const getWeekDateRange = () => {
    if (!weekStart) return '';
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const weekNum = getWeekNumber(start);
    return `Week ${weekNum}: ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Handler for TaskModal onSave (add mode)
  const handleAddTask = (formData) => {
    if (!formData.title.trim()) return;

    const task = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      quadrant: formData.quadrant,
      dueDate: formData.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      icon: formData.icon || getAutoIcon(formData.title),
      delegate: formData.delegate || '',
      goalId: formData.goalId || null
    };

    setTasks([...tasks, task]);

    // Update goal if task is linked to one
    if (formData.goalId) {
      const updatedGoals = goals.map(g => {
        if (g.id === formData.goalId) {
          const linkedTasks = g.linkedTasks || [];
          return {
            ...g,
            linkedTasks: [...linkedTasks, task.id],
            lastActivity: new Date().toISOString().split('T')[0]
          };
        }
        return g;
      });
      setGoals(updatedGoals);
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
    }

    setSelectedQuadrant(null);
    setShowAddModal(false);
  };

  // Handler for TaskModal onSave (edit mode)
  const handleUpdateTask = (formData) => {
    if (!formData.title.trim()) return;

    const oldTask = tasks.find(t => t.id === formData.id);
    if (oldTask) {
      saveToHistory('edit', { ...oldTask });
    }

    const updatedTask = { ...formData, icon: formData.icon || getAutoIcon(formData.title) };
    setTasks(tasks.map(task =>
      task.id === formData.id ? updatedTask : task
    ));

    // Handle goal linking changes
    const oldGoalId = oldTask?.goalId;
    const newGoalId = formData.goalId;

    if (oldGoalId !== newGoalId) {
      const updatedGoals = goals.map(g => {
        // Remove from old goal
        if (g.id === oldGoalId) {
          return {
            ...g,
            linkedTasks: (g.linkedTasks || []).filter(id => id !== formData.id)
          };
        }
        // Add to new goal
        if (g.id === newGoalId) {
          const linkedTasks = g.linkedTasks || [];
          return {
            ...g,
            linkedTasks: linkedTasks.includes(formData.id) ? linkedTasks : [...linkedTasks, formData.id],
            lastActivity: new Date().toISOString().split('T')[0]
          };
        }
        return g;
      });
      setGoals(updatedGoals);
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
    }

    setEditingTask(null);
    setShowEditModal(false);
  };

  const openAddModal = (quadrant = null) => {
    setSelectedQuadrant(quadrant);
    setShowAddModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDueDate = (dueDate) => {
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
  };

  const toggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // If completing a Q3 task and no delegate is set, show delegate modal
      if (!task.completed && task.quadrant === 'q3' && !task.delegate) {
        setDelegateTaskId(taskId);
        setDelegateName('');
        setShowDelegateModal(true);
      } else {
        // Complete the task normally
        saveToHistory('complete', { ...task });
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ));
      }
    }
  };

  const deleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      saveToHistory('delete', { ...task });
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const addShoutout = () => {
    if (!newShoutout.colleague.trim() || !newShoutout.note.trim()) return;

    const shoutout = {
      id: Date.now(),
      colleague: newShoutout.colleague,
      note: newShoutout.note,
      createdAt: new Date().toISOString()
    };

    setShoutouts([...shoutouts, shoutout]);
    setNewShoutout({ colleague: '', note: '' });
    setShowShoutoutModal(false);
  };

  const deleteShoutout = (shoutoutId) => {
    const shoutout = shoutouts.find(s => s.id === shoutoutId);
    if (shoutout) {
      saveToHistory('deleteShoutout', { ...shoutout });
      setShoutouts(shoutouts.filter(s => s.id !== shoutoutId));
    }
  };

  const confirmDelegate = () => {
    if (!delegateName.trim()) return;

    const task = tasks.find(t => t.id === delegateTaskId);
    if (task) {
      saveToHistory('complete', { ...task });
      setTasks(tasks.map(t =>
        t.id === delegateTaskId ? { ...t, completed: !t.completed, delegate: delegateName } : t
      ));
    }

    setShowDelegateModal(false);
    setDelegateTaskId(null);
    setDelegateName('');
  };

  const moveTask = (taskId, newQuadrant) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.quadrant !== newQuadrant) {
      saveToHistory('move', { ...task });
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, quadrant: newQuadrant } : t
      ));
    }
  };

  const handleDragStart = (e, task) => {
    isDraggingRef.current = true;
    draggedTaskRef.current = task;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);

    // Add visual class directly to the element being dragged
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, quadrant) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverQuadrant(quadrant);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the quadrant container entirely
    if (e.currentTarget === e.target) {
      setDragOverQuadrant(null);
    }
  };

  const handleDrop = (e, quadrant) => {
    e.preventDefault();
    if (draggedTaskRef.current) {
      moveTask(draggedTaskRef.current.id, quadrant);
      draggedTaskRef.current = null;
      isDraggingRef.current = false;
      setDragOverQuadrant(null);
    }
  };

  const handleDragEnd = (e) => {
    // Clean up state even if drop was cancelled
    draggedTaskRef.current = null;
    isDraggingRef.current = false;
    setDragOverQuadrant(null);

    // Remove visual class
    e.currentTarget.classList.remove('dragging');
  };

  const endWeek = () => {
    const completedTasks = tasks.filter(t => t.completed);
    const activeGoals = goals.filter(g => g.status === 'active');
    const pausedGoals = goals.filter(g => g.status === 'paused');

    let message = `End this week and start fresh?\n\n`;
    if (completedTasks.length > 0) {
      message += `• Download summary of ${completedTasks.length} completed task(s)\n`;
    } else {
      message += `No completed tasks to summarize.\n`;
    }
    if (activeGoals.length > 0 || pausedGoals.length > 0) {
      message += `• Include ${activeGoals.length + pausedGoals.length} goal(s) status in summary\n`;
    }
    if (shoutouts.length > 0) {
      message += `• Include ${shoutouts.length} shoutout(s) in summary\n`;
    }
    message += `• Clear all completed tasks${shoutouts.length > 0 ? ' and shoutouts' : ''}\n`;
    message += `• Reset for new week`;

    setEndWeekMessage(message);
    setShowEndWeekModal(true);
  };

  const confirmEndWeek = () => {
    const completedTasks = tasks.filter(t => t.completed);
    const activeGoals = goals.filter(g => g.status === 'active');
    const pausedGoals = goals.filter(g => g.status === 'paused');
    let snapshot = '';

    if (completedTasks.length > 0 || shoutouts.length > 0 || activeGoals.length > 0 || pausedGoals.length > 0) {
      snapshot = `Weekly Summary - ${getWeekDateRange()}\n\n`;

      if (completedTasks.length > 0) {
        snapshot += `COMPLETED TASKS:\n\n`;
        ['q1', 'q2', 'q3', 'q4'].forEach(quadrant => {
          const quadrantTasks = completedTasks.filter(t => t.quadrant === quadrant);
          if (quadrantTasks.length > 0) {
            const quadrantName = {
              q1: 'Urgent & Important (Do First)',
              q2: 'Important, Not Urgent (Schedule)',
              q3: 'Urgent, Not Important (Delegate)',
              q4: 'Neither Urgent nor Important (Eliminate/Communicate)'
            }[quadrant];

            snapshot += `${quadrantName}:\n`;
            quadrantTasks.forEach(task => {
              snapshot += `✓ ${task.title}\n`;
              if (task.description) {
                snapshot += `  ${task.description}\n`;
              }
            });
            snapshot += '\n';
          }
        });
      }

      if (activeGoals.length > 0 || pausedGoals.length > 0) {
        snapshot += `GOALS STATUS:\n\n`;

        if (activeGoals.length > 0) {
          snapshot += `Active Goals (${activeGoals.length}):\n`;
          activeGoals.forEach(goal => {
            snapshot += `🎯 ${goal.title}\n`;
            if (goal.description) {
              snapshot += `  ${goal.description}\n`;
            }

            // Show progress for major goals
            if (goal.type === 'major' && goal.subGoals && goal.subGoals.length > 0) {
              const completed = goal.subGoals.filter(sg => sg.status === 'complete').length;
              const total = goal.subGoals.length;
              const percentage = Math.round((completed / total) * 100);
              snapshot += `  Progress: ${completed}/${total} sub-goals (${percentage}%)\n`;

              // List sub-goals with status
              goal.subGoals.forEach(sg => {
                const status = sg.status === 'complete' ? '✓' : '○';
                snapshot += `    ${status} ${sg.title}\n`;
              });
            }

            // Show linked tasks count
            if (goal.linkedTasks && goal.linkedTasks.length > 0) {
              snapshot += `  Linked tasks: ${goal.linkedTasks.length}\n`;
            }

            // Show staleness
            if (goal.lastActivity) {
              const daysSince = Math.floor((new Date() - new Date(goal.lastActivity)) / (1000 * 60 * 60 * 24));
              if (daysSince > 0) {
                snapshot += `  Last activity: ${daysSince} day${daysSince !== 1 ? 's' : ''} ago\n`;
              }
            } else {
              snapshot += `  No activity yet\n`;
            }

            snapshot += '\n';
          });
        }

        if (pausedGoals.length > 0) {
          snapshot += `Paused Goals (${pausedGoals.length}):\n`;
          pausedGoals.forEach(goal => {
            snapshot += `⏸ ${goal.title}\n`;
            if (goal.description) {
              snapshot += `  ${goal.description}\n`;
            }
            snapshot += '\n';
          });
        }
      }

      if (shoutouts.length > 0) {
        snapshot += `SHOUTOUTS:\n\n`;
        shoutouts.forEach(shoutout => {
          snapshot += `❤ ${shoutout.colleague}\n`;
          snapshot += `  ${shoutout.note}\n\n`;
        });
      }

      // Download the file
      const blob = new Blob([snapshot], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const weekNum = getWeekNumber(new Date(weekStart));
      a.download = `task-summary-week${weekNum}-${weekStart}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Save to history
      const historyEntry = {
        id: `${weekStart}-${Date.now()}`, // Unique ID
        weekStart: weekStart,
        weekEnd: new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weekNumber: getWeekNumber(new Date(weekStart)),
        dateRange: getWeekDateRange(),
        completedCount: completedTasks.length,
        summary: snapshot,
        endedAt: new Date().toISOString()
      };
      
      const updatedHistory = [historyEntry, ...weeklyHistory];
      setWeeklyHistory(updatedHistory);
      localStorage.setItem('taskPrioritizerHistory', JSON.stringify(updatedHistory));
    }

    setTasks(tasks.filter(t => !t.completed));
    setShoutouts([]);
    localStorage.setItem('taskPrioritizerShoutouts', JSON.stringify([]));
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const newWeekStart = monday.toISOString().split('T')[0];
    setWeekStart(newWeekStart);
    localStorage.setItem('taskPrioritizerWeekStart', newWeekStart);

    setShowEndWeekModal(false);
  };

  const downloadWeekSummary = (entry) => {
    const blob = new Blob([entry.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const weekNum = entry.weekNumber || getWeekNumber(new Date(entry.weekStart));
    a.download = `task-summary-week${weekNum}-${entry.weekStart}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteHistoryEntry = (entryId) => {
    const updatedHistory = weeklyHistory.filter(entry => entry.id !== entryId);
    setWeeklyHistory(updatedHistory);
    localStorage.setItem('taskPrioritizerHistory', JSON.stringify(updatedHistory));
  };
  
  const confirmDeleteHistory = (entry) => {
    setHistoryToDelete(entry);
    setShowDeleteHistoryModal(true);
  };
  
  const executeDeleteHistory = () => {
    if (historyToDelete) {
      deleteHistoryEntry(historyToDelete.id);
      setHistoryToDelete(null);
      setShowDeleteHistoryModal(false);
    }
  };

  const backupData = () => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tasks: tasks,
      weekStart: weekStart,
      weeklyHistory: weeklyHistory,
      shoutouts: shoutouts,
      goals: JSON.parse(localStorage.getItem('goals') || '[]'),
      goalArchive: JSON.parse(localStorage.getItem('goalArchive') || '[]')
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-prioritizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        
        // Validate backup structure
        if (!backup.version || !backup.tasks || !backup.weekStart) {
          setRestoreMessage('❌ Invalid backup file format.');
          return;
        }
        
        // Restore data
        setTasks(backup.tasks || []);
        setWeekStart(backup.weekStart);
        setWeeklyHistory(backup.weeklyHistory || []);
        setShoutouts(backup.shoutouts || []);
        setGoals(backup.goals || []);

        // Save to localStorage
        localStorage.setItem('taskPrioritizerTasks', JSON.stringify(backup.tasks || []));
        localStorage.setItem('taskPrioritizerWeekStart', backup.weekStart);
        localStorage.setItem('taskPrioritizerHistory', JSON.stringify(backup.weeklyHistory || []));
        localStorage.setItem('taskPrioritizerShoutouts', JSON.stringify(backup.shoutouts || []));
        localStorage.setItem('goals', JSON.stringify(backup.goals || []));
        localStorage.setItem('goalArchive', JSON.stringify(backup.goalArchive || []));
        
        setRestoreMessage(`✅ Successfully restored backup from ${new Date(backup.exportDate).toLocaleDateString()}`);
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setRestoreMessage('');
          setShowBackupModal(false);
        }, 3000);
      } catch (error) {
        setRestoreMessage('❌ Error reading backup file. Please check the file and try again.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const getTaskFontFamily = (quadrant) => {
    // Use urgentImportantFont for Q1 if set, otherwise use taskFont
    if (quadrant === 'q1' && urgentImportantFont) {
      const font = availableFonts.find(f => f.name === urgentImportantFont);
      return font ? font.family : availableFonts.find(f => f.name === taskFont)?.family || "'Indie Flower', cursive";
    }
    const font = availableFonts.find(f => f.name === taskFont);
    return font ? font.family : "'Indie Flower', cursive";
  };

  const getQuadrantTasks = (quadrant) => {
    return tasks
      .filter(t => t.quadrant === quadrant)
      .filter(t => !hideCompletedTasks || !t.completed)
      .sort((a, b) => {
        // Sort by: 1) not completed first, 2) has due date, 3) due date ascending, 4) no date

        // Completed tasks go last
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        // Both have due dates - sort by date (earliest first)
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }

        // Tasks with dates come before tasks without dates
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;

        // Both have no dates - maintain creation order
        return 0;
      });
  };

  // Helper to render a quadrant with proper props for the extracted Quadrant component
  const renderQuadrant = (quadrantId) => (
    <Quadrant
      quadrant={quadrantId}
      tasks={getQuadrantTasks(quadrantId)}
      allTasks={tasks}
      isDropTarget={dragOverQuadrant === quadrantId}
      isDragging={draggedTask !== null}
      fontFamily={getTaskFontFamily(quadrantId)}
      onAddTask={openAddModal}
      onEditTask={openEditModal}
      onDeleteTask={deleteTask}
      onToggleComplete={toggleComplete}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onShowOverloadWarning={() => setShowQ1OverloadModal(true)}
      isOverdue={isOverdue}
      formatDueDate={formatDueDate}
    />
  );

  return (
    <div className="min-h-screen p-4" style={{ 
      background: 'linear-gradient(135deg, #f5f5f0 0%, #e8e8e0 100%)',
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-2xl p-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-white">
              <div className="text-lg font-bold">Task Prioritizer</div>
              <div className="text-xs text-gray-300 flex items-center gap-1.5">
                <Calendar size={12} />
                {getWeekDateRange()}
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleUndo}
              disabled={undoHistory.length === 0}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-2 py-1.5 rounded shadow-lg flex items-center justify-center transition-all"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoHistory.length === 0}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-2 py-1.5 rounded shadow-lg flex items-center justify-center transition-all"
              title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
            >
              <RotateCw size={16} />
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button
              onClick={() => openAddModal()}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Add Task
            </button>
            <button
              onClick={() => setShowShoutoutModal(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
              title="Add Shoutout"
            >
              <Heart size={16} />
              Shoutout
            </button>
            <button
              onClick={endWeek}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
            >
              <Download size={16} />
              End Week
            </button>
            <div className="relative more-dropdown-container">
              <button
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
                title="More options"
              >
                <MoreVertical size={16} />
                More
              </button>
              {showMoreDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setHideCompletedTasks(!hideCompletedTasks);
                      setShowMoreDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    {hideCompletedTasks ? <EyeOff size={16} className="text-gray-600" /> : <Eye size={16} className="text-gray-600" />}
                    <span>{hideCompletedTasks ? 'Show' : 'Hide'} Completed</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      setShowHistoryModal(true);
                      setShowMoreDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <Calendar size={16} className="text-purple-500" />
                    <span>History</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      setShowFontModal(true);
                      setShowMoreDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <Type size={16} className="text-indigo-500" />
                    <span>Fonts</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowBackupModal(true);
                      setShowMoreDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <Download size={16} className="text-orange-500" />
                    <span>Backup & Restore</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowMoreDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <HelpCircle size={16} className="text-gray-500" />
                    <span>Help</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          className="rounded-xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.15)',
          }}
        >
          <div className="relative">
            <div className="grid grid-cols-2 divide-x-2 divide-gray-300">
              <div className="grid grid-rows-2 divide-y-2 divide-gray-300">
                {renderQuadrant('q1')}
                {renderQuadrant('q3')}
              </div>
              <div className="grid grid-rows-2 divide-y-2 divide-gray-300">
                {renderQuadrant('q2')}
                {renderQuadrant('q4')}
              </div>
            </div>
          </div>
        </div>

        {shoutouts.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={20} className="text-pink-500" />
              <h2 className="text-lg font-bold text-gray-900">This Week's Shoutouts</h2>
            </div>
            <div className="space-y-3">
              {shoutouts.map((shoutout) => (
                <div
                  key={shoutout.id}
                  className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 relative"
                >
                  <button
                    onClick={() => deleteShoutout(shoutout.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete shoutout"
                  >
                    <X size={16} />
                  </button>
                  <div className="pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart size={14} className="text-pink-500 fill-pink-500" />
                      <h3
                        className="font-bold text-gray-900"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                      >
                        {shoutout.colleague}
                      </h3>
                    </div>
                    <p
                      className="text-gray-700 text-sm"
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                    >
                      {shoutout.note}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(shoutout.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={showAddModal}
        mode="add"
        selectedQuadrant={selectedQuadrant}
        goals={goals}
        onSave={handleAddTask}
        onClose={() => {
          setShowAddModal(false);
          setSelectedQuadrant(null);
        }}
      />

      <TaskModal
        isOpen={showEditModal}
        mode="edit"
        task={editingTask}
        goals={goals}
        onSave={handleUpdateTask}
        onClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
      />

      {showEndWeekModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">End Week</h2>
              <button
                onClick={() => setShowEndWeekModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6 whitespace-pre-line text-gray-700">
              {endWeekMessage}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmEndWeek}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                End Week
              </button>
              <button
                onClick={() => setShowEndWeekModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Weekly History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {weeklyHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No completed weeks yet.</p>
                  <p className="text-sm mt-1">Complete tasks and end a week to see history here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weeklyHistory.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{entry.dateRange}</h3>
                          <p className="text-sm text-gray-600">
                            {entry.completedCount} task{entry.completedCount !== 1 ? 's' : ''} completed
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadWeekSummary(entry)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Download summary"
                          >
                            <Download size={20} />
                          </button>
                          <button
                            onClick={() => confirmDeleteHistory(entry)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Ended: {new Date(entry.endedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View summary
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                          {entry.summary}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteHistoryModal && historyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delete History Entry</h2>
              <button
                onClick={() => {
                  setShowDeleteHistoryModal(false);
                  setHistoryToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete this week's history?
              </p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="font-semibold text-gray-900">{historyToDelete.dateRange}</p>
                <p className="text-sm text-gray-600">
                  {historyToDelete.completedCount} task{historyToDelete.completedCount !== 1 ? 's' : ''} completed
                </p>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={executeDeleteHistory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteHistoryModal(false);
                  setHistoryToDelete(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Backup & Restore</h2>
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setRestoreMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Backup Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Download all your tasks, current week, and history to a JSON file.
                </p>
                <button
                  onClick={backupData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Backup
                </button>
              </div>

              <div className="border-t pt-6">
                {/* Restore Section */}
                <h3 className="font-semibold text-gray-900 mb-2">Import Data</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Restore from a previously exported backup file. This will replace all current data.
                </p>
                <label className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                  <Upload size={18} />
                  Upload Backup
                </label>
                
                {restoreMessage && (
                  <div className={`mt-3 p-3 rounded text-sm ${
                    restoreMessage.startsWith('✅') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {restoreMessage}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Important:</strong> Importing a backup will replace all existing data. Make sure to export your current data first if you want to keep it.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setRestoreMessage('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showShoutoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart size={24} className="text-pink-500" />
                Give a Shoutout
              </h2>
              <button
                onClick={() => {
                  setShowShoutoutModal(false);
                  setNewShoutout({ colleague: '', note: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colleague Name *
                </label>
                <input
                  type="text"
                  value={newShoutout.colleague}
                  onChange={(e) => setNewShoutout({ ...newShoutout, colleague: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Who do you want to recognize?"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note *
                </label>
                <textarea
                  value={newShoutout.note}
                  onChange={(e) => setNewShoutout({ ...newShoutout, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="What did they do that was great?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={addShoutout}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Add Shoutout
                </button>
                <button
                  onClick={() => {
                    setShowShoutoutModal(false);
                    setNewShoutout({ colleague: '', note: '' });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <Q1OverloadModal
        isOpen={showQ1OverloadModal}
        onClose={() => setShowQ1OverloadModal(false)}
        q1TaskCount={tasks.filter(t => t.quadrant === 'q1' && !t.completed).length}
      />

      {showFontModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Type size={24} className="text-indigo-500" />
                Font Settings
              </h2>
              <button
                onClick={() => setShowFontModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Task Font
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  This font will be used for all tasks across all quadrants
                </p>
                <select
                  value={taskFont}
                  onChange={(e) => setTaskFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {availableFonts.map(font => (
                    <option key={font.name} value={font.name}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <div style={{ fontFamily: availableFonts.find(f => f.name === taskFont)?.family }}>
                    <div className="text-base font-medium">Task Title Example</div>
                    <div className="text-sm text-gray-700">This is a sample task description</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgent & Important (Q1) Font <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Use a different font for high-priority tasks in the Urgent & Important quadrant. Leave blank to use the default task font.
                </p>
                <select
                  value={urgentImportantFont}
                  onChange={(e) => setUrgentImportantFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Use Default Font</option>
                  {availableFonts.map(font => (
                    <option key={font.name} value={font.name}>
                      {font.name}
                    </option>
                  ))}
                </select>
                {urgentImportantFont && (
                  <div className="mt-3 p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-gray-600 mb-1">Q1 Preview:</p>
                    <div style={{ fontFamily: availableFonts.find(f => f.name === urgentImportantFont)?.family }}>
                      <div className="text-base font-medium">Urgent Task Title</div>
                      <div className="text-sm text-gray-700">High priority task description</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Use a bold or distinct font for Q1 tasks to make urgent and important items stand out visually!
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowFontModal(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelegateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delegate Task</h2>
              <button
                onClick={() => {
                  setShowDelegateModal(false);
                  setDelegateTaskId(null);
                  setDelegateName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 text-sm">
                This is an Urgent, Not Important task. Who are you delegating this to?
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delegate To *
                </label>
                <input
                  type="text"
                  value={delegateName}
                  onChange={(e) => setDelegateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Name of person to delegate to"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && delegateName.trim()) {
                      confirmDelegate();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmDelegate}
                  disabled={!delegateName.trim()}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Complete & Delegate
                </button>
                <button
                  onClick={() => {
                    setShowDelegateModal(false);
                    setDelegateTaskId(null);
                    setDelegateName('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dragging {
          opacity: 0.5 !important;
          transform: scale(0.95) !important;
          box-shadow: 6px 6px 12px rgba(0,0,0,0.3) !important;
        }
      `}</style>
    </div>
  );
};

// Main App wrapper with tab navigation
const App = () => {
  const [currentView, setCurrentView] = useState('tasks'); // tasks | goals
  const [tasks, setTasks] = useState([]);

  // Load tasks from localStorage on mount and refresh when view changes
  useEffect(() => {
    const loadTasks = () => {
      const savedTasks = localStorage.getItem('taskPrioritizerTasks');
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (error) {
          console.error('Failed to parse tasks from localStorage:', error);
          setTasks([]);
        }
      }
    };

    loadTasks();

    // Refresh tasks when switching to goals view
    if (currentView === 'goals') {
      const interval = setInterval(loadTasks, 1000);
      return () => clearInterval(interval);
    }
  }, [currentView]);

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('tasks')}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                currentView === 'tasks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CheckSquare size={18} />
              Tasks
            </button>
            <button
              onClick={() => setCurrentView('goals')}
              className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
                currentView === 'goals'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Target size={18} />
              Goals
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'tasks' && <TaskPrioritizer />}
      {currentView === 'goals' && <GoalBoard tasks={tasks} />}
    </div>
  );
};

export default App;

