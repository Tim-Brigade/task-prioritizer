# Goals Feature Implementation Specification
**For Task Prioritizer Application**

## Project Overview

Add comprehensive goal management functionality to the existing Task Prioritizer app, maintaining visual consistency with the current whiteboard/post-it note aesthetic while providing powerful goal tracking capabilities.

---

## Core Requirements

### 1. Work/Personal Separation
- **CRITICAL**: Maintain strict separation between work and personal goals
- Two completely separate instances:
  - Work goals on work computer/account
  - Personal goals on home computer/account
- No cross-contamination of contexts
- Implementation: Use localStorage keys `goals_work` and `goals_personal` but only ONE is active per deployment

### 2. Goal Framework (from research session)

#### Goal Types

**Major Goals**
- Complex objectives requiring multiple milestones
- Hierarchical structure with sub-goals
- Progress tracking (X of Y complete)
- Timeline-based staleness monitoring

**Simple Goals**
- Straightforward single-outcome objectives
- Flat structure (no sub-goals)
- Direct completion tracking

#### Goal Attributes (All Goals)
```javascript
{
  id: 'goal-uuid-v4',
  type: 'major' | 'simple',
  title: string,
  outcome: string,  // Clear definition of "done"
  timeline: {
    start: 'YYYY-MM-DD',
    end: 'YYYY-MM-DD'
  },
  status: 'active' | 'paused' | 'completed' | 'abandoned',
  lastActivity: 'YYYY-MM-DD',
  createdAt: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  linkedTasks: ['task-id-1', 'task-id-2'],  // Array of task IDs
  
  // Only for major goals:
  subGoals: [
    {
      id: 'subgoal-uuid',
      title: string,
      targetDate: 'YYYY-MM-DD',
      status: 'pending' | 'complete'
    }
  ]
}
```

#### Staleness Thresholds (Timeline-Relative)
```javascript
const getStalenessThreshold = (startDate, endDate) => {
  const durationDays = daysBetween(startDate, endDate);
  
  if (durationDays < 30) return 7;      // < 1 month: 7 days
  if (durationDays < 90) return 14;     // 1-3 months: 14 days
  if (durationDays < 180) return 21;    // 3-6 months: 21 days
  return 30;                             // 6+ months: 30 days
};
```

### 3. Task Integration

#### Modify Existing Task Schema
Add to existing task objects:
```javascript
{
  // ...existing task fields
  goalId: 'goal-uuid' | null  // Link to parent goal
}
```

#### Integration Points
- Tasks can be tagged to goals via dropdown selector
- Goal's "last activity" updates when linked task is created/completed/modified
- Goal's "next action" displays the highest-priority incomplete task linked to it
- Completing a task increments goal progress (if task completion implies sub-goal completion)

---

## UI/UX Design

### Visual Consistency
- Maintain existing whiteboard aesthetic
- Reuse post-it note styling for goal cards
- Same colour palette and typography
- Same drag-and-drop feel where appropriate

### Navigation Structure

#### Option A: Tab Navigation (Recommended)
```
┌─────────────────────────────────────────┐
│  [Tasks] [Goals] [History]              │ <- Top navigation
└─────────────────────────────────────────┘
```

When "Goals" is selected:
```
┌─────────────────────────────────────────┐
│  Tasks [Goals] History                  │
│  ┌────────────────────────────────────┐ │
│  │  Active (5) │ Paused (2) │ Archive │ │ <- Sub-tabs
│  └────────────────────────────────────┘ │
│                                         │
│  [+ New Goal]                           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 🎯 Launch film scanner      85%  │  │
│  │ Jan - Jun 2026     🚨 2 days     │  │
│  │ Next: Refine film gate design    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 📸 AI Network cameras       20%  │  │
│  │ Jan - Dec 2026    ⚠️ 12 days     │  │
│  │ Next: Research AI chip options   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Goal Card Design

#### List View Card (Collapsed)
```
┌────────────────────────────────────────────┐
│ 🎯 Launch film scanner              [85%] │ <- Icon + Title + Progress
│ Jan - Jun 2026              🚨 2 days ago  │ <- Timeline + Staleness warning
│ Next: Refine film gate design for 35mm    │ <- Next action
│                                            │
│ [View Details] [Edit] [⏸ Pause]           │ <- Actions
└────────────────────────────────────────────┘
```

**Staleness Indicators:**
- ✅ Green: Activity within threshold
- ⚠️ Amber: Approaching threshold (75% of threshold elapsed)
- 🚨 Red: Beyond threshold

#### Detail View (Expanded/Modal)

For **Major Goals**:
```
┌──────────────────────────────────────────────────────────┐
│  🎯 Launch film scanner                                  │
│  ───────────────────────────────────────────────────────│
│                                                          │
│  Timeline: January - June 2026                           │
│  Status: Active                                          │
│  Last Activity: 2 days ago 🚨                            │
│                                                          │
│  Outcome:                                                │
│  First production batch of 50 units available for        │
│  purchase, website live, 5 units sold                    │
│                                                          │
│  Progress: 2 of 9 sub-goals complete (22%)               │
│  ━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░                    │
│                                                          │
│  Sub-goals:                                              │
│  ✅ Complete optical design validation                   │
│  ✅ Finalise mechanical design in FreeCAD                │
│  ⏳ Develop scanning software (Mar 2026)                 │
│  ⏳ Complete 3D printed enclosure (Mar 2026)             │
│  ⏳ Source belt-driven transport (Apr 2026)              │
│  ⏳ Build 3 prototypes (Apr 2026)                        │
│  ⏳ Order production batch (May 2026)                    │
│  ⏳ Launch website (Jun 2026)                            │
│  ⏳ Sell 5 units (Jun 2026)                              │
│                                                          │
│  Linked Tasks (3):                                       │
│  → Refine film gate design for 35mm clearance           │
│  → Order belt drive components                          │
│  → Test IMX477 sensor alignment                         │
│                                                          │
│  [Edit Goal] [Add Sub-goal] [⏸ Pause] [✓ Complete]     │
└──────────────────────────────────────────────────────────┘
```

For **Simple Goals**:
```
┌──────────────────────────────────────────────────────────┐
│  🍛 Learn to make lentil dahl curry                      │
│  ───────────────────────────────────────────────────────│
│                                                          │
│  Timeline: January - February 2026                       │
│  Status: Active                                          │
│  Last Activity: Never started                            │
│                                                          │
│  Outcome:                                                │
│  Successfully cooked dahl 3 times without recipe,        │
│  comfortable with technique and spicing                  │
│                                                          │
│  Linked Tasks (1):                                       │
│  → Research authentic dahl recipes and technique         │
│                                                          │
│  [Edit Goal] [✓ Complete]                                │
└──────────────────────────────────────────────────────────┘
```

### Forms

#### Create/Edit Goal Form
```
┌──────────────────────────────────────────┐
│  Create New Goal                         │
│  ────────────────────────────────────────│
│                                          │
│  Goal Type:                              │
│  ○ Simple Goal  ● Major Goal             │
│                                          │
│  Title:                                  │
│  [________________________]              │
│                                          │
│  Outcome (what does "done" look like?):  │
│  [________________________]              │
│  [________________________]              │
│  [________________________]              │
│                                          │
│  Timeline:                               │
│  Start: [__________]  End: [__________]  │
│                                          │
│  --- If Major Goal ---                   │
│                                          │
│  Sub-goals:                              │
│  1. [________________________] [Date]    │
│  2. [________________________] [Date]    │
│  3. [________________________] [Date]    │
│  [+ Add Sub-goal]                        │
│                                          │
│  [Cancel] [Create Goal]                  │
└──────────────────────────────────────────┘
```

### Archive View
Show completed and abandoned goals with:
- Completion date
- Final progress
- Ability to view details (read-only)
- Ability to permanently delete

---

## Technical Implementation

### File Structure

```
task-prioritizer/
├── src/
│   ├── components/
│   │   ├── Task.jsx                    (existing)
│   │   ├── TaskBoard.jsx               (existing)
│   │   ├── WeeklySummary.jsx           (existing)
│   │   ├── HistoryView.jsx             (existing)
│   │   ├── Goal.jsx                    (NEW)
│   │   ├── GoalBoard.jsx               (NEW)
│   │   ├── GoalDetail.jsx              (NEW)
│   │   ├── GoalForm.jsx                (NEW)
│   │   ├── SubGoalList.jsx             (NEW)
│   │   ├── GoalArchive.jsx             (NEW)
│   │   └── Navigation.jsx              (NEW or MODIFY if exists)
│   ├── hooks/
│   │   ├── useLocalStorage.js          (existing)
│   │   ├── useGoals.js                 (NEW)
│   │   └── useGoalStaleness.js         (NEW)
│   ├── utils/
│   │   ├── dateUtils.js                (NEW)
│   │   └── goalUtils.js                (NEW)
│   ├── App.jsx                         (MODIFY)
│   └── main.jsx                        (existing)
├── index.html                          (existing)
├── package.json                        (existing)
└── vite.config.js                      (existing)
```

### localStorage Schema

```javascript
// Existing
localStorage.getItem('tasks')
localStorage.getItem('history')
localStorage.getItem('lastResetDate')

// New
localStorage.getItem('goals')  // Will store EITHER work or personal
localStorage.getItem('goalArchive')
localStorage.getItem('goalSettings')  // { context: 'work' | 'personal' }
```

**Note**: For deployment context (work vs personal), consider:
- Environment variable at build time: `VITE_CONTEXT=work` or `VITE_CONTEXT=personal`
- Or: Settings page where user selects context once, persisted to localStorage

### Core Data Management

#### useGoals.js Hook
```javascript
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getStalenessThreshold, isGoalStale } from '../utils/goalUtils';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('goals');
    if (stored) {
      setGoals(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals, loading]);

  const createGoal = (goalData) => {
    const newGoal = {
      id: uuidv4(),
      ...goalData,
      status: 'active',
      lastActivity: null,
      createdAt: new Date().toISOString(),
      linkedTasks: []
    };
    setGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = (id, updates) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const archiveGoal = (id) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      // Move to archive
      const archive = JSON.parse(localStorage.getItem('goalArchive') || '[]');
      archive.push({
        ...goal,
        archivedAt: new Date().toISOString()
      });
      localStorage.setItem('goalArchive', JSON.stringify(archive));
      deleteGoal(id);
    }
  };

  const linkTask = (goalId, taskId) => {
    updateGoal(goalId, {
      linkedTasks: [...(goals.find(g => g.id === goalId)?.linkedTasks || []), taskId],
      lastActivity: new Date().toISOString().split('T')[0]
    });
  };

  const unlinkTask = (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      updateGoal(goalId, {
        linkedTasks: goal.linkedTasks.filter(id => id !== taskId)
      });
    }
  };

  const toggleSubGoalComplete = (goalId, subGoalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.type === 'major') {
      const updatedSubGoals = goal.subGoals.map(sg =>
        sg.id === subGoalId
          ? { ...sg, status: sg.status === 'complete' ? 'pending' : 'complete' }
          : sg
      );
      updateGoal(goalId, { 
        subGoals: updatedSubGoals,
        lastActivity: new Date().toISOString().split('T')[0]
      });
    }
  };

  const getActiveGoals = () => goals.filter(g => g.status === 'active');
  const getPausedGoals = () => goals.filter(g => g.status === 'paused');
  const getStaleGoals = () => goals.filter(g => isGoalStale(g));

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    linkTask,
    unlinkTask,
    toggleSubGoalComplete,
    getActiveGoals,
    getPausedGoals,
    getStaleGoals
  };
};
```

#### goalUtils.js
```javascript
export const getStalenessThreshold = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (durationDays < 30) return 7;
  if (durationDays < 90) return 14;
  if (durationDays < 180) return 21;
  return 30;
};

export const isGoalStale = (goal) => {
  if (!goal.lastActivity) return false; // Never started isn't "stale"
  
  const threshold = getStalenessThreshold(goal.timeline.start, goal.timeline.end);
  const daysSinceActivity = daysSince(goal.lastActivity);
  
  return daysSinceActivity >= threshold;
};

export const getStalenessLevel = (goal) => {
  if (!goal.lastActivity) return 'never';
  
  const threshold = getStalenessThreshold(goal.timeline.start, goal.timeline.end);
  const daysSinceActivity = daysSince(goal.lastActivity);
  
  if (daysSinceActivity >= threshold) return 'stale';
  if (daysSinceActivity >= threshold * 0.75) return 'warning';
  return 'fresh';
};

export const daysSince = (dateString) => {
  const then = new Date(dateString);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
};

export const calculateProgress = (goal) => {
  if (goal.type === 'simple') {
    return goal.status === 'completed' ? 100 : 0;
  }
  
  if (goal.type === 'major' && goal.subGoals) {
    const completed = goal.subGoals.filter(sg => sg.status === 'complete').length;
    const total = goal.subGoals.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  
  return 0;
};

export const getNextAction = (goal, tasks) => {
  if (!goal.linkedTasks || goal.linkedTasks.length === 0) {
    return 'No tasks linked to this goal';
  }
  
  // Find highest priority incomplete task
  // Assumes tasks have priority/quadrant field from Eisenhower Matrix
  const linkedTasks = tasks.filter(t => 
    goal.linkedTasks.includes(t.id) && !t.completed
  );
  
  if (linkedTasks.length === 0) {
    return 'All linked tasks completed';
  }
  
  // Return first incomplete task (can be enhanced with priority logic)
  return linkedTasks[0].text || 'View linked tasks';
};
```

### Component Implementation

#### Goal.jsx (Card Component)
```javascript
import React from 'react';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStalenessLevel, calculateProgress } from '../utils/goalUtils';

const Goal = ({ goal, tasks, onClick, onPause, onComplete }) => {
  const stalenessLevel = getStalenessLevel(goal);
  const progress = calculateProgress(goal);
  
  const getStalenessIcon = () => {
    switch(stalenessLevel) {
      case 'stale': return <AlertCircle className="text-red-500" />;
      case 'warning': return <AlertCircle className="text-amber-500" />;
      case 'fresh': return <CheckCircle2 className="text-green-500" />;
      default: return null;
    }
  };
  
  const getNextAction = () => {
    const linkedTasks = tasks.filter(t => 
      goal.linkedTasks.includes(t.id) && !t.completed
    );
    return linkedTasks.length > 0 
      ? linkedTasks[0].text 
      : 'No active tasks';
  };
  
  return (
    <div 
      className="bg-yellow-100 p-4 rounded shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{goal.title}</h3>
        {goal.type === 'major' && (
          <span className="text-sm font-semibold">{progress}%</span>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Calendar size={14} />
        <span>
          {new Date(goal.timeline.start).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          {' - '}
          {new Date(goal.timeline.end).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
        {stalenessLevel !== 'never' && (
          <span className="flex items-center gap-1 ml-auto">
            {getStalenessIcon()}
            {goal.lastActivity 
              ? `${daysSince(goal.lastActivity)} days ago`
              : 'Never started'
            }
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-700 italic">
        Next: {getNextAction()}
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPause(goal.id);
          }}
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          {goal.status === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(goal.id);
          }}
          className="text-xs px-2 py-1 bg-green-200 rounded hover:bg-green-300"
        >
          Complete
        </button>
      </div>
    </div>
  );
};

export default Goal;
```

#### GoalBoard.jsx (Main View)
```javascript
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Goal from './Goal';
import GoalDetail from './GoalDetail';
import GoalForm from './GoalForm';
import { useGoals } from '../hooks/useGoals';

const GoalBoard = ({ tasks }) => {
  const { 
    goals, 
    createGoal, 
    updateGoal, 
    archiveGoal 
  } = useGoals();
  
  const [view, setView] = useState('active'); // active | paused | archive
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const handlePause = (id) => {
    const goal = goals.find(g => g.id === id);
    updateGoal(id, { 
      status: goal.status === 'paused' ? 'active' : 'paused' 
    });
  };
  
  const handleComplete = (id) => {
    if (confirm('Mark this goal as complete?')) {
      updateGoal(id, { status: 'completed' });
      archiveGoal(id);
    }
  };
  
  const getFilteredGoals = () => {
    switch(view) {
      case 'active':
        return goals.filter(g => g.status === 'active');
      case 'paused':
        return goals.filter(g => g.status === 'paused');
      case 'archive':
        const archive = JSON.parse(localStorage.getItem('goalArchive') || '[]');
        return archive;
      default:
        return [];
    }
  };
  
  const filteredGoals = getFilteredGoals();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Goals</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded ${
              view === 'active' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700'
            }`}
          >
            Active ({goals.filter(g => g.status === 'active').length})
          </button>
          <button
            onClick={() => setView('paused')}
            className={`px-4 py-2 rounded ${
              view === 'paused' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700'
            }`}
          >
            Paused ({goals.filter(g => g.status === 'paused').length})
          </button>
          <button
            onClick={() => setView('archive')}
            className={`px-4 py-2 rounded ${
              view === 'archive' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700'
            }`}
          >
            Archive
          </button>
        </div>
      </div>
      
      {/* Goals Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.map(goal => (
          <Goal
            key={goal.id}
            goal={goal}
            tasks={tasks}
            onClick={() => setSelectedGoal(goal)}
            onPause={handlePause}
            onComplete={handleComplete}
          />
        ))}
        
        {filteredGoals.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No {view} goals yet
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showForm && (
        <GoalForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            createGoal(data);
            setShowForm(false);
          }}
        />
      )}
      
      {selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          tasks={tasks}
          onClose={() => setSelectedGoal(null)}
          onUpdate={updateGoal}
        />
      )}
    </div>
  );
};

export default GoalBoard;
```

### Task Modifications

#### Modify Task Component
Add goal selector when creating/editing tasks:

```javascript
// In Task.jsx or TaskForm.jsx
const [goalId, setGoalId] = useState(task.goalId || null);

// In form:
<select 
  value={goalId || ''} 
  onChange={(e) => setGoalId(e.target.value || null)}
  className="w-full p-2 border rounded"
>
  <option value="">No goal</option>
  {goals.map(g => (
    <option key={g.id} value={g.id}>{g.title}</option>
  ))}
</select>
```

#### Update Task Creation/Modification
When saving a task, if `goalId` is set, call `linkTask(goalId, taskId)` from useGoals hook.

### App.jsx Modifications

```javascript
import React, { useState } from 'react';
import TaskBoard from './components/TaskBoard';
import GoalBoard from './components/GoalBoard';
import HistoryView from './components/HistoryView';

const App = () => {
  const [currentView, setCurrentView] = useState('tasks'); // tasks | goals | history
  const [tasks, setTasks] = useState(/* existing task state */);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
          <button
            onClick={() => setCurrentView('tasks')}
            className={`px-4 py-2 rounded ${
              currentView === 'tasks' ? 'bg-blue-500 text-white' : 'text-gray-700'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setCurrentView('goals')}
            className={`px-4 py-2 rounded ${
              currentView === 'goals' ? 'bg-blue-500 text-white' : 'text-gray-700'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`px-4 py-2 rounded ${
              currentView === 'history' ? 'bg-blue-500 text-white' : 'text-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      {currentView === 'tasks' && <TaskBoard tasks={tasks} setTasks={setTasks} />}
      {currentView === 'goals' && <GoalBoard tasks={tasks} />}
      {currentView === 'history' && <HistoryView />}
    </div>
  );
};

export default App;
```

---

## Implementation Phases

### Phase 1: Core Data Layer (Day 1)
- [ ] Create `utils/goalUtils.js` with all helper functions
- [ ] Create `utils/dateUtils.js` for date calculations
- [ ] Create `hooks/useGoals.js` hook
- [ ] Test data persistence in localStorage
- [ ] Write unit tests for utilities

### Phase 2: Basic UI Components (Day 2)
- [ ] Create `Goal.jsx` card component
- [ ] Create `GoalBoard.jsx` main view
- [ ] Create `GoalForm.jsx` for create/edit
- [ ] Add navigation to `App.jsx`
- [ ] Test basic CRUD operations

### Phase 3: Advanced Features (Day 3)
- [ ] Create `GoalDetail.jsx` modal
- [ ] Create `SubGoalList.jsx` component
- [ ] Implement sub-goal management
- [ ] Add progress calculations
- [ ] Implement staleness detection and warnings

### Phase 4: Task Integration (Day 4)
- [ ] Modify task schema to include `goalId`
- [ ] Add goal selector to task forms
- [ ] Implement task linking/unlinking
- [ ] Update goal `lastActivity` when tasks change
- [ ] Show linked tasks in goal detail view
- [ ] Display "next action" from tasks

### Phase 5: Polish & Testing (Day 5)
- [ ] Create `GoalArchive.jsx` component
- [ ] Add archive functionality
- [ ] Implement goal status changes (pause/resume/complete/abandon)
- [ ] Add animations and transitions
- [ ] Test all user flows
- [ ] Fix bugs and edge cases
- [ ] Update README with goals documentation

---

## Additional Features (Optional/Future)

### Backup & Restore
Extend existing backup functionality to include goals:
```javascript
const exportData = () => {
  return JSON.stringify({
    tasks: localStorage.getItem('tasks'),
    goals: localStorage.getItem('goals'),
    goalArchive: localStorage.getItem('goalArchive'),
    history: localStorage.getItem('history'),
    exportedAt: new Date().toISOString()
  });
};
```

### Goal Templates
Pre-defined goal templates for common scenarios:
- Product launch
- Learning new skill
- Creative project
- Fitness goal

### Reporting
- Weekly goal review summary
- Progress over time charts
- Stale goal alerts

---

## Testing Checklist

### Functional Testing
- [ ] Create simple goal
- [ ] Create major goal with sub-goals
- [ ] Edit goal details
- [ ] Pause/resume goal
- [ ] Complete goal (moves to archive)
- [ ] Abandon goal
- [ ] Link task to goal
- [ ] Unlink task from goal
- [ ] Check goal staleness calculation
- [ ] Toggle sub-goal completion
- [ ] View goal progress
- [ ] Navigate between active/paused/archive

### Edge Cases
- [ ] Goal with no linked tasks
- [ ] Goal with all tasks completed
- [ ] Goal created with past dates
- [ ] Goal with future start date
- [ ] Sub-goal completion updates progress
- [ ] Deleting task updates goal's linked tasks
- [ ] Archive view is read-only

### Data Persistence
- [ ] Goals persist after page reload
- [ ] Archive persists after page reload
- [ ] Task-goal links persist
- [ ] Status changes persist

### UI/UX
- [ ] Cards match task prioritizer aesthetic
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation)
- [ ] Clear visual hierarchy
- [ ] Intuitive interactions

---

## Deployment Considerations

### Work vs Personal Context
Two deployment options:

**Option A: Build-time configuration**
```bash
# package.json scripts
"build:work": "VITE_CONTEXT=work vite build",
"build:personal": "VITE_CONTEXT=personal vite build"
```

Then in code:
```javascript
const context = import.meta.env.VITE_CONTEXT || 'work';
localStorage.setItem('appContext', context);
```

**Option B: Runtime configuration**
Add settings page where user selects context once, stored in localStorage.

### Recommended: Option A
Clearer separation, prevents accidental mixing of work/personal data.

---

## Documentation Updates

### README.md additions
```markdown
## Goals Feature

Track and manage both major and simple goals with:
- 🎯 Hierarchical goal structure (goals → sub-goals → tasks)
- 📊 Automatic progress tracking
- ⚠️ Staleness detection with timeline-relative alerts
- 🔗 Deep integration with task prioritizer
- 📦 Backup & restore including goals
- 🗄️ Archive for completed goals

### Work/Personal Separation
Goals are strictly separated by deployment context. Use separate
deployments or browser profiles for work vs personal goals.
```

---

## Success Criteria

The implementation is complete when:
1. All five implementation phases are finished
2. All functional tests pass
3. Goals persist correctly across page reloads
4. UI matches existing task prioritizer aesthetic
5. Task-goal integration works bidirectionally
6. Staleness detection correctly flags old goals
7. Archive functionality works correctly
8. Documentation is updated

---

## Notes for Claude Code

### Existing Code to Preserve
- Do not modify the existing Eisenhower Matrix task functionality
- Maintain the current whiteboard aesthetic
- Keep existing localStorage structure for tasks
- Preserve backup/restore functionality (extend it, don't replace)

### Code Style
- Match existing code style and conventions
- Use same component patterns as TaskBoard.jsx
- Maintain existing colour palette
- Use same icon library (Lucide React)

### Dependencies
No new dependencies required beyond what's already installed:
- React 18
- Lucide React (for icons)
- uuid (if not already present, add for ID generation)

### Key Implementation Details
1. Goals and tasks are separate but linked data structures
2. Work/personal separation happens at deployment level
3. All staleness thresholds are dynamic based on goal timeline
4. Progress calculation differs between major/simple goals
5. Archive is append-only (completed/abandoned goals move there)

---

## Questions for Tim (if clarification needed during implementation)

1. Should sub-goals have their own linked tasks, or only top-level goals?
2. Any specific emoji/icon preferences for goal types?
3. Preferred date format (DD/MM/YYYY or locale-based)?
4. Should the app prevent creating overlapping goals?
5. Any specific export format needed for reporting?
