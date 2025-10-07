import React, { useState, useEffect } from 'react';
import { Check, Plus, X, Calendar, Download, Edit2, Upload, HelpCircle } from 'lucide-react';

const TaskPrioritizer = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEndWeekModal, setShowEndWeekModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState(null);
  const [endWeekMessage, setEndWeekMessage] = useState('');
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [restoreMessage, setRestoreMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', quadrant: 'q2', dueDate: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [weekStart, setWeekStart] = useState('');

  useEffect(() => {
    const savedTasks = localStorage.getItem('taskPrioritizerTasks');
    const savedWeekStart = localStorage.getItem('taskPrioritizerWeekStart');
    const savedHistory = localStorage.getItem('taskPrioritizerHistory');
    const hasSeenHelp = localStorage.getItem('taskPrioritizerHasSeenHelp');

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
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 2,
          title: 'Learn new programming framework',
          description: 'Invest in professional development',
          quadrant: 'q2',
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 3,
          title: 'Plan next quarter strategy',
          description: 'Set goals and roadmap',
          quadrant: 'q2',
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 4,
          title: 'Respond to non-urgent emails',
          description: 'Quick replies needed',
          quadrant: 'q3',
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 5,
          title: 'Attend optional meeting',
          description: 'Could be handled via email',
          quadrant: 'q3',
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 6,
          title: 'Browse social media',
          description: 'Time-waster - consider eliminating',
          quadrant: 'q4',
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 7,
          title: 'Exercise and meal prep',
          description: 'Important for long-term health',
          quadrant: 'q2',
          dueDate: '',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 8,
          title: 'Client presentation tomorrow',
          description: 'Final preparations needed',
          quadrant: 'q1',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          completed: false,
          createdAt: new Date().toISOString()
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
    
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap';
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

  const getWeekDateRange = () => {
    if (!weekStart) return '';
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', quadrant: 'q2', dueDate: '' });
    setSelectedQuadrant(null);
    setShowAddModal(false);
  };

  const openAddModal = (quadrant = null) => {
    if (quadrant) {
      setNewTask({ title: '', description: '', quadrant: quadrant, dueDate: '' });
      setSelectedQuadrant(quadrant);
    } else {
      setNewTask({ title: '', description: '', quadrant: 'q2', dueDate: '' });
      setSelectedQuadrant(null);
    }
    setShowAddModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const updateTask = () => {
    if (!editingTask.title.trim()) return;
    
    setTasks(tasks.map(task =>
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
    setShowEditModal(false);
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
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const moveTask = (taskId, newQuadrant) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, quadrant: newQuadrant } : task
    ));
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, quadrant) => {
    e.preventDefault();
    if (draggedTask) {
      moveTask(draggedTask.id, quadrant);
      setDraggedTask(null);
    }
  };

  const endWeek = () => {
    const completedTasks = tasks.filter(t => t.completed);
    
    const message = completedTasks.length > 0 
      ? `End this week and start fresh?\n\n• Download summary of ${completedTasks.length} completed task(s)\n• Clear all completed tasks\n• Reset for new week`
      : `End this week and start fresh?\n\nNo completed tasks to summarize.\n• Clear all tasks\n• Reset for new week`;
    
    setEndWeekMessage(message);
    setShowEndWeekModal(true);
  };

  const confirmEndWeek = () => {
    const completedTasks = tasks.filter(t => t.completed);
    let snapshot = '';
    
    if (completedTasks.length > 0) {
      snapshot = `Weekly Task Summary - ${getWeekDateRange()}\n\n`;
      
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

      // Download the file
      const blob = new Blob([snapshot], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-summary-${weekStart}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Save to history
      const historyEntry = {
        id: `${weekStart}-${Date.now()}`, // Unique ID
        weekStart: weekStart,
        weekEnd: new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    a.download = `task-summary-${entry.weekStart}.txt`;
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
      weeklyHistory: weeklyHistory
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
        
        // Save to localStorage
        localStorage.setItem('taskPrioritizerTasks', JSON.stringify(backup.tasks || []));
        localStorage.setItem('taskPrioritizerWeekStart', backup.weekStart);
        localStorage.setItem('taskPrioritizerHistory', JSON.stringify(backup.weeklyHistory || []));
        
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
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className={`relative cursor-move transition-all hover:scale-105 hover:shadow-xl ${
          task.completed ? 'opacity-60' : ''
        }`}
        style={{
          transform: `rotate(${rotate}deg)`,
          backgroundColor: config.color,
          boxShadow: '4px 4px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div className="p-3 min-h-[120px] flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
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
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              {task.title}
            </div>
            {task.description && (
              <div 
                className={`text-xs text-gray-700 break-words ${
                  task.completed ? 'line-through' : ''
                }`}
                style={{ fontFamily: "'Indie Flower', cursive" }}
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
              <span style={{ fontFamily: "'Indie Flower', cursive" }}>
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

  const Quadrant = ({ quadrant, config }) => (
    <div
      className="relative p-4 flex flex-col"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, quadrant)}
    >
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-white bg-opacity-80 backdrop-blur-sm px-3 py-1.5 rounded shadow-md">
          <div className="text-xs font-bold text-gray-800">{config.title}</div>
          <div className="text-xs text-gray-600">{config.subtitle}</div>
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
    </div>
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
                Week of {getWeekDateRange()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
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
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
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
                    <span><strong>Add Tasks:</strong> Click the "Add Task" button or the + icon in any quadrant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Drag & Drop:</strong> Move tasks between quadrants by dragging them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Due Dates:</strong> Set optional due dates; overdue tasks are highlighted in red</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Complete Tasks:</strong> Click the checkbox to mark tasks as complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Edit/Delete:</strong> Use the edit (pencil) or delete (X) icons on each task</span>
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
    </div>
  );
};

export default TaskPrioritizer;

