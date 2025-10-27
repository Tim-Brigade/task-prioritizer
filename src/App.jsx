import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, X, Calendar, Download, Edit2, Upload, HelpCircle, Heart, Type, AlertTriangle } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const TaskPrioritizer = () => {
  const [tasks, setTasks] = useState([]);
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
  const [newTask, setNewTask] = useState({ title: '', description: '', quadrant: 'q2', dueDate: '', icon: '📝' });
  const [editingTask, setEditingTask] = useState(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState(null);
  const [weekStart, setWeekStart] = useState('');
  const [shoutouts, setShoutouts] = useState([]);
  const [showShoutoutModal, setShowShoutoutModal] = useState(false);
  const [newShoutout, setNewShoutout] = useState({ colleague: '', note: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [taskFont, setTaskFont] = useState('Indie Flower');
  const [urgentImportantFont, setUrgentImportantFont] = useState('');
  const [showQ1OverloadModal, setShowQ1OverloadModal] = useState(false);
  const [hasSeenQ1Warning, setHasSeenQ1Warning] = useState(false);

  // Use ref for drag state to avoid re-renders during drag
  const draggedTaskRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Undo history
  const [undoHistory, setUndoHistory] = useState([]);

  // Q1 overload threshold
  const Q1_OVERLOAD_THRESHOLD = 6;

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

  // Auto-select icon based on task title
  const getAutoIcon = (title) => {
    const lowerTitle = title.toLowerCase();

    // Define keyword mappings to emojis
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

    // Find first matching keyword
    for (const { keywords, emoji } of iconMap) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return emoji;
      }
    }

    // Default icon
    return '📝';
  };

  useEffect(() => {
    const savedTasks = localStorage.getItem('taskPrioritizerTasks');
    const savedWeekStart = localStorage.getItem('taskPrioritizerWeekStart');
    const savedHistory = localStorage.getItem('taskPrioritizerHistory');
    const savedShoutouts = localStorage.getItem('taskPrioritizerShoutouts');
    const hasSeenHelp = localStorage.getItem('taskPrioritizerHasSeenHelp');
    const savedTaskFont = localStorage.getItem('taskPrioritizerTaskFont');
    const savedUrgentImportantFont = localStorage.getItem('taskPrioritizerUrgentImportantFont');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Load example tasks for first-time users
      const exampleTasks = [
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
      setTasks(exampleTasks);
    }

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

  // Keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoHistory, tasks, shoutouts]);

  const saveToHistory = (action, data) => {
    setUndoHistory(prev => [...prev, { action, data, timestamp: Date.now() }].slice(-20)); // Keep last 20 actions
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

    // Remove the undone action from history
    setUndoHistory(prev => prev.slice(0, -1));
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

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      quadrant: newTask.quadrant,
      dueDate: newTask.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      icon: newTask.icon || getAutoIcon(newTask.title)
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', quadrant: 'q2', dueDate: '', icon: '📝' });
    setSelectedQuadrant(null);
    setShowAddModal(false);
    setShowEmojiPicker(false);
  };

  const handleNewTaskTitleChange = (title) => {
    setNewTask({ ...newTask, title, icon: getAutoIcon(title) });
  };

  const handleEditTaskTitleChange = (title) => {
    setEditingTask({ ...editingTask, title, icon: getAutoIcon(title) });
  };

  const openAddModal = (quadrant = null) => {
    if (quadrant) {
      setNewTask({ title: '', description: '', quadrant: quadrant, dueDate: '', icon: '📝' });
      setSelectedQuadrant(quadrant);
    } else {
      setNewTask({ title: '', description: '', quadrant: 'q2', dueDate: '', icon: '📝' });
      setSelectedQuadrant(null);
    }
    setShowAddModal(true);
    setShowEmojiPicker(false);
  };

  const openEditModal = (task) => {
    setEditingTask({ ...task, icon: task.icon || getAutoIcon(task.title) });
    setShowEditModal(true);
    setShowEditEmojiPicker(false);
  };

  const updateTask = () => {
    if (!editingTask.title.trim()) return;

    const oldTask = tasks.find(t => t.id === editingTask.id);
    if (oldTask) {
      saveToHistory('edit', { ...oldTask });
    }

    setTasks(tasks.map(task =>
      task.id === editingTask.id ? { ...editingTask, icon: editingTask.icon || getAutoIcon(editingTask.title) } : task
    ));
    setEditingTask(null);
    setShowEditModal(false);
    setShowEditEmojiPicker(false);
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
      saveToHistory('complete', { ...task });
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
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

    let message = `End this week and start fresh?\n\n`;
    if (completedTasks.length > 0) {
      message += `• Download summary of ${completedTasks.length} completed task(s)\n`;
    } else {
      message += `No completed tasks to summarize.\n`;
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
    let snapshot = '';

    if (completedTasks.length > 0 || shoutouts.length > 0) {
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
              q4: 'Neither Urgent nor Important (Eliminate)'
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
      shoutouts: shoutouts
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

        // Save to localStorage
        localStorage.setItem('taskPrioritizerTasks', JSON.stringify(backup.tasks || []));
        localStorage.setItem('taskPrioritizerWeekStart', backup.weekStart);
        localStorage.setItem('taskPrioritizerHistory', JSON.stringify(backup.weeklyHistory || []));
        localStorage.setItem('taskPrioritizerShoutouts', JSON.stringify(backup.shoutouts || []));
        
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

  const quadrantConfig = {
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
      subtitle: 'Eliminate',
      color: '#E0E0E0',
      darkColor: '#9E9E9E'
    }
  };

  const PostItNote = ({ task, config }) => {
    const rotate = (task.id % 6) - 3;

    // Check if this is a top priority Q1 task (top 3 incomplete tasks)
    const q1Tasks = getQuadrantTasks('q1');
    const incompleteQ1Tasks = q1Tasks.filter(t => !t.completed);
    const taskIndex = incompleteQ1Tasks.findIndex(t => t.id === task.id);
    const isTopPriority = task.quadrant === 'q1' && !task.completed && taskIndex >= 0 && taskIndex < 3;

    const handleDragStartWrapper = (e) => {
      // Prevent drag if starting from a button
      const target = e.target;
      if (target.closest('button') || target.tagName === 'BUTTON') {
        e.preventDefault();
        return;
      }
      handleDragStart(e, task);
    };

    const handleDoubleClick = (e) => {
      // Don't trigger edit if double-clicking on buttons
      const target = e.target;
      if (target.closest('button') || target.tagName === 'BUTTON') {
        return;
      }
      openEditModal(task);
    };

    return (
      <div
        draggable
        onDragStart={handleDragStartWrapper}
        onDragEnd={handleDragEnd}
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
                onClick={() => toggleComplete(task.id)}
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
                    title={`Top priority #${taskIndex + 1}`}
                  >
                    {taskIndex + 1}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => openEditModal(task)}
                className="text-gray-600 hover:text-blue-700 transition-colors"
                title="Edit"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
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
              style={{ fontFamily: getTaskFontFamily(task.quadrant) }}
            >
              {task.title}
            </div>
            {task.description && (
              <div
                className={`text-xs text-gray-700 break-words ${
                  task.completed ? 'line-through' : ''
                }`}
                style={{ fontFamily: getTaskFontFamily(task.quadrant) }}
              >
                {task.description}
              </div>
            )}
          </div>
          
          {task.dueDate && (
            <div className={`text-xs mt-2 flex items-center gap-1 ${
              task.completed 
                ? 'text-gray-500 line-through' 
                : isOverdue(task.dueDate)
                ? 'text-red-700 font-bold'
                : 'text-gray-700'
            }`}>
              <Calendar size={10} />
              <span style={{ fontFamily: getTaskFontFamily(task.quadrant) }}>
                {formatDueDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
        
        <div 
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-white bg-opacity-40"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
        />
      </div>
    );
  };

  const Quadrant = ({ quadrant, config }) => {
    const isDropTarget = dragOverQuadrant === quadrant;
    const isDragging = draggedTask !== null;
    const q1Tasks = tasks.filter(t => t.quadrant === 'q1' && !t.completed);
    const isQ1Overloaded = quadrant === 'q1' && q1Tasks.length >= Q1_OVERLOAD_THRESHOLD;

    return (
      <div
        className={`relative p-4 flex flex-col transition-all ${
          isDragging ? 'ring-2 ring-transparent' : ''
        } ${isDropTarget ? 'ring-4 ring-blue-400 ring-opacity-50 bg-blue-50 bg-opacity-30' : ''}`}
        onDragOver={(e) => handleDragOver(e, quadrant)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, quadrant)}
      >
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
                  onClick={() => setShowQ1OverloadModal(true)}
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                  title="Q1 overload warning - click for tips"
                >
                  <AlertTriangle size={16} className="animate-pulse" />
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => openAddModal(quadrant)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10"
          title="Add task"
        >
          <Plus size={18} className="text-gray-700" />
        </button>

        <div className="mt-16 grid grid-cols-2 gap-4 auto-rows-min">
          {getQuadrantTasks(quadrant).map(task => (
            <PostItNote key={task.id} task={task} config={config} />
          ))}
        </div>

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
          <div className="flex gap-2">
            <button
              onClick={() => setShowFontModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
              title="Font Settings"
            >
              <Type size={16} />
              Fonts
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
              title="Help"
            >
              <HelpCircle size={16} />
              Help
            </button>
            <button
              onClick={() => setShowBackupModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
              title="Backup & Restore"
            >
              <Download size={16} />
              Backup
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
            >
              <Calendar size={16} />
              History
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
              onClick={() => openAddModal()}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Add Task
            </button>
            <button
              onClick={endWeek}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 transition-all text-sm font-medium"
            >
              <Download size={16} />
              End Week
            </button>
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
                <Quadrant quadrant="q1" config={quadrantConfig.q1} />
                <Quadrant quadrant="q3" config={quadrantConfig.q3} />
              </div>
              <div className="grid grid-rows-2 divide-y-2 divide-gray-300">
                <Quadrant quadrant="q2" config={quadrantConfig.q2} />
                <Quadrant quadrant="q4" config={quadrantConfig.q4} />
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedQuadrant(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-3xl px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Click to change icon"
                  >
                    {newTask.icon}
                  </button>
                  <span className="text-xs text-gray-500">Auto-selected based on title</span>
                </div>
                {showEmojiPicker && (
                  <div className="mt-2 relative z-10">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setNewTask({ ...newTask, icon: emojiData.emoji });
                        setShowEmojiPicker(false);
                      }}
                      width="100%"
                      height={350}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => handleNewTaskTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Optional details"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quadrant
                </label>
                <select
                  value={newTask.quadrant}
                  onChange={(e) => setNewTask({ ...newTask, quadrant: e.target.value })}
                  disabled={selectedQuadrant !== null}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="q1">Q1: Urgent & Important</option>
                  <option value="q2">Q2: Important, Not Urgent</option>
                  <option value="q3">Q3: Urgent, Not Important</option>
                  <option value="q4">Q4: Neither</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedQuadrant(null);
                    setShowEmojiPicker(false);
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

      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                  setShowEditEmojiPicker(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
                    className="text-3xl px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Click to change icon"
                  >
                    {editingTask.icon || '📝'}
                  </button>
                  <span className="text-xs text-gray-500">Auto-selected based on title</span>
                </div>
                {showEditEmojiPicker && (
                  <div className="mt-2 relative z-10">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setEditingTask({ ...editingTask, icon: emojiData.emoji });
                        setShowEditEmojiPicker(false);
                      }}
                      width="100%"
                      height={350}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => handleEditTaskTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quadrant
                </label>
                <select
                  value={editingTask.quadrant}
                  onChange={(e) => setEditingTask({ ...editingTask, quadrant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="q1">Q1: Urgent & Important</option>
                  <option value="q2">Q2: Important, Not Urgent</option>
                  <option value="q3">Q3: Urgent, Not Important</option>
                  <option value="q4">Q4: Neither</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={updateTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                    setShowEditEmojiPicker(false);
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

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">How to Use Task Prioritizer</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Overview</h3>
                <p className="text-gray-700">
                  Task Prioritizer uses the <strong>Eisenhower Matrix</strong> (also called the Urgent-Important Matrix) to help you organize tasks by urgency and importance.
                  Named after President Dwight D. Eisenhower, this method helps you focus on what truly matters.
                </p>
              </section>

              <section className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="text-lg font-bold text-green-900 mb-2">🎯 Why Use the Eisenhower Matrix?</h3>
                <ul className="space-y-2 text-green-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Reduce stress:</strong> Stop reacting to everything as urgent; prioritize what matters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Increase productivity:</strong> Focus energy on high-impact tasks instead of busywork</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Achieve goals:</strong> Spend more time on strategic work (Q2) that drives long-term success</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Better work-life balance:</strong> Identify and eliminate time-wasters (Q4)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span><strong>Make confident decisions:</strong> Clear framework for saying "no" to less important tasks</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">📊 The Four Quadrants</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-400 pl-3">
                    <h4 className="font-semibold text-gray-900">Q1: Urgent & Important (Do First)</h4>
                    <p className="text-sm text-gray-600">Critical tasks requiring immediate attention. Crises, deadlines, emergencies.</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-3">
                    <h4 className="font-semibold text-gray-900">Q2: Important, Not Urgent (Schedule)</h4>
                    <p className="text-sm text-gray-600">Strategic tasks for long-term success. Planning, development, relationship building.</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-3">
                    <h4 className="font-semibold text-gray-900">Q3: Urgent, Not Important (Delegate)</h4>
                    <p className="text-sm text-gray-600">Tasks that demand attention but don't contribute to your goals. Interruptions, some emails.</p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-3">
                    <h4 className="font-semibold text-gray-900">Q4: Neither Urgent nor Important (Eliminate)</h4>
                    <p className="text-sm text-gray-600">Time-wasters and distractions. Consider eliminating these tasks.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">✨ Key Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Task Icons:</strong> Colorful icons are automatically assigned based on task titles (e.g., 🐛 for "bug", 📧 for "email"). Click the icon in the Add/Edit modal to choose a different one.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Add Tasks:</strong> Click the "Add Task" button in the header or the + icon in any quadrant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Drag & Drop:</strong> Click and drag anywhere on a task (except buttons) to move it between quadrants. Drop zones highlight in blue when hovering.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Due Dates:</strong> Set optional due dates; overdue tasks are highlighted in red. Tasks automatically sort by due date within each quadrant.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Auto-Promotion:</strong> Tasks on the not urgent side (Q2, Q4) automatically move to the urgent side (Q1, Q3) when their due date is today or overdue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Complete Tasks:</strong> Click the checkbox on a task to mark it complete. Completed tasks appear at the bottom with strikethrough text.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Edit/Delete:</strong> Double-click anywhere on a task to edit, or use the edit (pencil) icon. Use the X icon to delete permanently.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Shoutouts:</strong> Click "Shoutout" to recognize colleagues' great work. Shoutouts are included in your weekly summary download.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Weekly Summaries:</strong> Click "End Week" to download a summary of completed tasks and shoutouts, then start fresh for the next week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>History:</strong> View and download summaries from previous weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Undo:</strong> Press Ctrl+Z (or Cmd+Z on Mac) to undo your last action (delete, edit, move, or complete). Keeps last 20 actions.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">📅 Weekly Workflow</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Work on tasks throughout the week, marking them complete as you finish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Click <strong>"End Week"</strong> to download a summary and clear completed tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>View past weeks in <strong>"History"</strong> to track your progress</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">💾 Backup & Restore</h3>
                <p className="text-gray-700 mb-2">
                  Your data is stored locally in your browser. Use the <strong>Backup</strong> feature to:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4">
                  <li>• Export all tasks, history, and settings to a JSON file</li>
                  <li>• Restore data from a previous backup</li>
                  <li>• Transfer data between devices or browsers</li>
                </ul>
              </section>

              <section className="bg-purple-50 border border-purple-200 rounded p-4">
                <h3 className="text-lg font-bold text-purple-900 mb-2">🔒 Privacy & Data Security</h3>
                <p className="text-purple-800 text-sm mb-2">
                  Your privacy matters! Task Prioritizer is designed with privacy-first principles:
                </p>
                <ul className="space-y-1 text-purple-800 text-sm ml-4">
                  <li>• <strong>100% Local Storage:</strong> All your tasks and data are stored only on your device in your browser's localStorage</li>
                  <li>• <strong>No Data Transmission:</strong> Your task data never leaves your computer - nothing is sent to any server</li>
                  <li>• <strong>No Tracking:</strong> No analytics, no cookies, no data collection of any kind</li>
                  <li>• <strong>You Own Your Data:</strong> Export anytime using the Backup feature</li>
                  <li>• <strong>Open Source:</strong> Review the code on GitHub to verify our privacy claims</li>
                </ul>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Pro Tip</h3>
                <p className="text-blue-800 text-sm">
                  Focus most of your time on <strong>Quadrant 2</strong> (Important, Not Urgent).
                  These strategic tasks prevent Q1 crises and lead to long-term success!
                </p>
              </section>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {showQ1OverloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={24} className="text-orange-600" />
                Q1 Overload Warning
              </h2>
              <button
                onClick={() => setShowQ1OverloadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="text-orange-900 font-semibold mb-2">
                  You have {tasks.filter(t => t.quadrant === 'q1' && !t.completed).length} incomplete tasks in Q1 (Urgent & Important)
                </p>
                <p className="text-orange-800 text-sm">
                  Having too many urgent and important tasks can lead to stress and burnout. Let's review your priorities.
                </p>
              </div>

              <section>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  🔥 Why Q1 Overload Happens
                </h3>
                <p className="text-gray-700 text-sm mb-2">
                  Research shows that many Q1 crises originate from <strong>neglected Q2 tasks</strong> (Important but Not Urgent).
                  When we don't invest in planning, prevention, and strategic work, those tasks eventually become urgent fires.
                </p>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  💡 How to Reduce Q1 Overload
                </h3>
                <ul className="space-y-2 text-blue-900 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span><strong>Review each Q1 task:</strong> Are they ALL truly urgent AND important? Some might actually belong in Q2 or Q3.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span><strong>Focus on top 2-3 priorities:</strong> You can't do everything at once. What MUST be done today?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span><strong>Break large tasks into smaller steps:</strong> Overwhelming tasks become manageable when divided into concrete actions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span><strong>Schedule Q2 time:</strong> Invest in important-but-not-urgent tasks (planning, prevention, skill-building) to prevent future crises.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">5.</span>
                    <span><strong>Delegate or postpone:</strong> Can any Q1 tasks be delegated to someone else or scheduled for tomorrow?</span>
                  </li>
                </ul>
              </section>

              <section className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-bold text-green-900 mb-2">
                  🎯 The Q2 Solution
                </h3>
                <p className="text-green-800 text-sm">
                  Successful people spend most of their time in <strong>Q2</strong> (Important, Not Urgent).
                  By proactively working on planning, development, and prevention, you'll have fewer Q1 fires to fight.
                  Make Q2 your priority to reduce stress and achieve your goals.
                </p>
              </section>

              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-xs text-gray-700">
                  <strong>💭 Remember:</strong> Productivity isn't about doing everything—it's about doing the right things.
                  Take a deep breath, prioritize ruthlessly, and focus on what truly matters.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowQ1OverloadModal(false)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                I'll Review My Priorities
              </button>
            </div>
          </div>
        </div>
      )}

      {showFontModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
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

            <div className="space-y-6">
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

export default TaskPrioritizer;

